const regionDictionary = {
    "north": [
        "Hà Nội", "Hải Phòng", "Quảng Ninh", "Lào Cai", "Yên Bái",
        "Tuyên Quang", "Hà Giang", "Phú Thọ", "Vĩnh Phúc", "Bắc Giang",
        "Bắc Kạn", "Hòa Bình", "Thái Nguyên", "Cao Bằng", "Bắc Ninh",
        "Lạng Sơn", "Quảng Bình", "Sơn La", "Điện Biên", "Thái Bình",
        "Nam Định", "Ninh Bình", "Hưng Yên", "Thanh Hóa", "Nghệ An",
        "Hà Tĩnh"
    ],

    "central": [
        "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên",
        "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Gia Lai", "Kon Tum",
        "Tây Nguyên", "Lâm Đồng", "Đắk Lắk", "Đắk Nông"
    ],

    "south": [
        "TP Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Vũng Tàu", "Cần Thơ",
        "Long An", "Tiền Giang", "Bến Tre", "Trà Vinh", "Vĩnh Long",
        "Sóc Trăng", "Bạc Liêu", "Cà Mau", "Kiên Giang", "Hậu Giang",
        "An Giang", "Đồng Tháp", "Mỹ Tho", "Phú Quốc", "Bình Phước",
        "Bình Thuận", "Ninh Thuận"
    ]
};

// Hàm chuẩn hóa tên tỉnh thành để xử lý trường hợp nhập sai
const normalizeProvinceName = (province) => {
    // Chuyển tất cả thành chữ thường và loại bỏ các từ không cần thiết
    province = province.toLowerCase();

    // Loại bỏ "thành phố", "tỉnh", và các ký tự đặc biệt
    province = province.replace("thành phố", "").replace("tỉnh", "").trim();

    return province;
};

// Hàm tra cứu miền của tỉnh thành
export const getRegionByProvince = (province) => {
    // Chuẩn hóa tên tỉnh thành
    const normalizedProvince = normalizeProvinceName(province);

    for (let region in regionDictionary) {
        for (let prov of regionDictionary[region]) {
            if (normalizeProvinceName(prov).toLowerCase() === normalizedProvince) {
                return region; // Trả về miền của tỉnh thành
            }
        }
    }
    return ''; // Trả về chuỗi rỗng nếu không tìm thấy
}

// // Ví dụ sử dụng:
// console.log(getRegionByProvince("Thành Phố Hà Nội"));  // Kết quả: "Bắc"
// console.log(getRegionByProvince("Hà Nội"));  // Kết quả: "Bắc"
// console.log(getRegionByProvince("Thành phố Đà Nẵng"));  // Kết quả: "Trung"
// console.log(getRegionByProvince("Cần Thơ"));  // Kết quả: "Nam"