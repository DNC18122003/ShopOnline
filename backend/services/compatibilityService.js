/**
 * Lấy giá trị spec từ Product.
 * - Ưu tiên trường phẳng `specifications[key]`
 * - Cho phép fallback `detail_json` nhưng có kiểm soát theo `componentType`
 *   để tránh trường hợp data bị trộn (ví dụ CASE lại có socket CPU trong detail_json).
 *
 * @param {Object} product
 * @param {String} componentType  cpu|mainboard|ram|gpu|psu|case
 * @param {String} key
 * @returns {String|Number|null}
 */
const getSpecValue = (product, componentType, key) => {
  if (!product || !product.specifications) return null;

  // 1) Direct field in specifications
  if (
    product.specifications[key] !== undefined &&
    product.specifications[key] !== null &&
    product.specifications[key] !== ""
  ) {
    return product.specifications[key];
  }

  // 2) Fallback detail_json (controlled)
  const allowDetailJsonFallback = {
    cpu: new Set(["socket", "ram_type", "tdp_w"]),
    mainboard: new Set(["socket", "ram_type", "form_factor"]),
    ram: new Set(["ram_type", "capacity"]),
    gpu: new Set(["tdp_w"]),
    psu: new Set(["wattage"]),
    case: new Set(["form_factor"]),
  };

  if (!allowDetailJsonFallback[componentType]?.has(key)) return null;

  const detail = product.specifications.detail_json || {};

  const aliasesByKey = {
    socket: ["Socket", "socket", "Loại Socket"],
    ram_type: ["Hỗ trợ RAM", "Loại RAM", "ram_type", "RAM"],
    form_factor: ["Kích thước mainboard", "Chuẩn mainboard", "form_factor"],
    tdp_w: ["TDP", "Công suất tiêu thụ", "tdp_w"],
    wattage: ["wattage", "Công suất", "Nguồn"],
    capacity: ["capacity", "Dung lượng"],
  };

  const possibleKeys = aliasesByKey[key] || [key];
  for (const k of possibleKeys) {
    if (detail[k] !== undefined && detail[k] !== null && detail[k] !== "") return detail[k];
  }

  return null;
};

/**
 * Chuẩn hoá giá trị (VD: "LGA 1700" -> "LGA1700")
 */
const normalizeValue = (val) => {
  if (typeof val === "string") {
    return val.toUpperCase().replace(/\s+/g, "");
  }
  return val;
};

/**
 * Trích số từ string kiểu "65 W" -> 65
 */
const parseNumber = (val) => {
  if (typeof val === "number") return val;
  if (typeof val !== "string") return NaN;
  const m = val.match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : NaN;
};

/**
 * Kiểm tra tương thích (cơ bản):
 * - CPU <-> Mainboard: socket
 * - Mainboard <-> RAM: ram_type
 * - Mainboard <-> Case: form_factor
 * - PSU: wattage cảnh báo dư tải
 */
const checkCompatibility = async (components) => {
  const issues = [];
  const warnings = [];

  const { cpu, mainboard, ram, gpu, psu, case: pcCase } = components;

  // 1) CPU <-> Mainboard (Socket)
  if (cpu && mainboard) {
    const cpuSocket = normalizeValue(getSpecValue(cpu, "cpu", "socket"));
    const mainSocket = normalizeValue(getSpecValue(mainboard, "mainboard", "socket"));

    if (cpuSocket && mainSocket && cpuSocket !== mainSocket) {
      issues.push({
        code: "SOCKET_MISMATCH",
        message: `CPU (${cpuSocket}) không khớp Socket với Mainboard (${mainSocket}).`,
      });
    }
  }

  // 2) Mainboard <-> RAM (RAM Type)
  if (mainboard && ram) {
    const mainRamType = normalizeValue(getSpecValue(mainboard, "mainboard", "ram_type"));
    const ramType = normalizeValue(getSpecValue(ram, "ram", "ram_type"));

    if (
      mainRamType &&
      ramType &&
      !mainRamType.includes(ramType) &&
      !ramType.includes(mainRamType)
    ) {
      issues.push({
        code: "RAM_TYPE_MISMATCH",
        message: `Mainboard hỗ trợ ${mainRamType} nhưng bạn chọn RAM ${ramType}.`,
      });
    }
  }

  // 3) PSU Wattage (warning only)
  if (psu) {
    let totalTdp = 0;

    if (cpu) {
      const cpuTdp = parseNumber(getSpecValue(cpu, "cpu", "tdp_w"));
      totalTdp += Number.isFinite(cpuTdp) ? cpuTdp : 100;
    }

    if (gpu) {
      const gpuTdp = parseNumber(getSpecValue(gpu, "gpu", "tdp_w"));
      totalTdp += Number.isFinite(gpuTdp) ? gpuTdp : 200;
    } else {
      totalTdp += 50; // iGPU hoặc không chọn GPU
    }

    const psuWattage = parseNumber(getSpecValue(psu, "psu", "wattage")) || 0;

    // +150W headroom cơ bản cho an toàn
    if (psuWattage > 0 && psuWattage < totalTdp + 150) {
      warnings.push({
        code: "PSU_POTENTIAL_LOW",
        message: `Công suất nguồn (${psuWattage}W) có thể hơi thấp so với cấu hình này (ước tính nên >= ${Math.round(
          totalTdp + 150,
        )}W để an toàn).`,
      });
    }
  }

  // 4) Mainboard <-> Case (Form Factor)
  if (mainboard && pcCase) {
    const mainForm = normalizeValue(getSpecValue(mainboard, "mainboard", "form_factor"));
    const caseForm = normalizeValue(getSpecValue(pcCase, "case", "form_factor"));

    // Đơn giản hoá: ATX case lắp được mATX, ITX. mATX case KHÔNG lắp được ATX.
    const forms = ["EATX", "ATX", "MATX", "ITX"];
    const mainIdx = forms.indexOf(mainForm);
    const caseIdx = forms.indexOf(caseForm);

    if (mainIdx !== -1 && caseIdx !== -1 && mainIdx < caseIdx) {
      issues.push({
        code: "FORM_FACTOR_MISMATCH",
        message: `Mainboard kích thước ${mainForm} quá lớn so với Case hỗ trợ tối đa ${caseForm}.`,
      });
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    warnings,
  };
};

module.exports = {
  checkCompatibility,
  getSpecValue,
  normalizeValue,
  parseNumber,
};
