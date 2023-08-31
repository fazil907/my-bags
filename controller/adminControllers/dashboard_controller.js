const User = require('../../models/userModel');
const Sale = require('../../models/orderModel')
const moment = require('moment')

exports.dashboardGet = async (req,res)=>{
  try {
    const sales = await Sale.find({});

    const salesByMonth = {};

    sales.forEach((sale) => {
        const monthYear = moment(sale.date).format("MMMM YYYY");
        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = {
                totalOrders: 0,
                totalRevenue: 0,
            };
        }
        salesByMonth[monthYear].totalOrders += 1;
        salesByMonth[monthYear].totalRevenue += sale.total;
    });

    const chartData = [];

    Object.keys(salesByMonth).forEach((monthYear) => {
        const { totalOrders, totalRevenue } = salesByMonth[monthYear];
        chartData.push({
            month: monthYear.split(" ")[0],
            totalOrders: totalOrders || 0,
            totalRevenue: totalRevenue || 0,
        });
    });

    months = [];
    ordersByMonth = [];
    revenueByMonth = [];
    totalRevenue = 0;
    totalSales = 0;

    chartData.forEach((data) => {
        months.push(data.month);
        ordersByMonth.push(data.totalOrders);
        revenueByMonth.push(data.totalRevenue);
        totalRevenue += Number(data.totalRevenue);
        totalSales += Number(data.totalOrders);
    });

    const thisMonthOrder = ordersByMonth[ordersByMonth.length - 1];
    const thisMonthSales = revenueByMonth[revenueByMonth.length - 1];

    res.render("adminDashboard", {
        user: req.session.admin,
        revenueByMonth,
        months,
        ordersByMonth,
        totalRevenue,
        totalSales,
        thisMonthOrder,
        thisMonthSales,
    });
} catch (error) {
    console.log(error.message);
}
}

exports.chartData = async (req, res) => {
  try {
      res.json({
          months: months,
          revenueByMonth: revenueByMonth,
          ordersByMonth: ordersByMonth,
      });
  } catch (error) {
      console.log(error.message);
  }
};