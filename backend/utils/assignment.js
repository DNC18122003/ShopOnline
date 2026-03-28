const OrderAssignment = require("../models/Order/OrderAssignment");
const Employee = require("../models/Employee");
const Department = require("../models/Department");

const assignOrderToSale = async (orderId) => {
  try {
    //  tìm department sale
    const saleDepartment = await Department.findOne({ name: "sale" });

    if (!saleDepartment) {
      console.log("Không tìm thấy department sale");
      return null;
    }

    //  lấy danh sách sale đang active
    const sales = await Employee.find({
      role: saleDepartment._id,
      isActive: "active",
    });

    if (!sales.length) {
      console.log("Không có sale khả dụng");
      return null;
    }

    //  tìm sale có ít đơn nhất
    let selectedSale = null;
    let minOrders = Infinity;

    for (const sale of sales) {
      const activeOrders = await OrderAssignment.countDocuments({
        saleId: sale._id,
        status: "assigned",
      });

      if (activeOrders < minOrders) {
        minOrders = activeOrders;
        selectedSale = sale;
      }
    }

    if (!selectedSale) return null;

    //  tạo assignment
    const assignment = await OrderAssignment.create({
      orderId,
      saleId: selectedSale._id,
      status: "assigned",
      assignedAt: new Date(),
    });

    console.log(`Đã gán đơn ${orderId} cho sale ${selectedSale.fullName}`);

    return assignment;
  } catch (error) {
    console.error("Assign order error:", error);
    return null;
  }
};

module.exports = { assignOrderToSale };
