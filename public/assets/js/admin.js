// ORDER UPDATE

const orderUpdateSelects = document.querySelectorAll('[name="orderUpdate"]');

if (orderUpdateSelects) {
  orderUpdateSelects.forEach((orderUpdateSelect) => {
    orderUpdateSelect.addEventListener("change", async () => {
      const selectedOption = orderUpdateSelect.value;
      const orderId = orderUpdateSelect.id.split("-")[1];

      try {
        const result = await Swal.fire({
          title: `Confirm Change Order Status to "${selectedOption}"?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, Change",
          cancelButtonText: "DISMISS",
        });

        if (result.value) {
          const response = await fetch(
            `/admin/updateOrder?orderId=${orderId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: selectedOption,
              }),
            }
          );

          const data = await response.json();

          if (data.message == "Success") {
            const result2 = await Swal.fire({
              icon: "success",
              title: "Order staus has been changed successfully!!",
              showConfirmButton: true,
              confirmButtonText: "OK",
              confirmButtonColor: "#4CAF50",
            });

            if (result2.value) {
              location.reload();
            }
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    });
  });
}

// add Coupon

const addCouponForm = document.getElementById("addCoupon");

if (addCouponForm) {
  addCouponForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("/admin/addCoupon", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.message === "coupon added") {
        const result = await Swal.fire({
          icon: "success",
          title: "New Coupon added Successfully",
          showConfirmButton: true,
          confirmButtonText: "OK",
          confirmButtonColor: "#4CAF50",
        });
        if (result.value) {
          form.reset();
          window.location.href = "/admin/coupons";
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Some error occured",
          showConfirmButton: true,
          confirmButtonText: "CANCEL",
          confirmButtonColor: "#D22B2B",
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
}

/////////////// DELETE COUPON ////////////////////

const deleteCoupon = async (couponId) => {
  try {
    const result = await Swal.fire({
      title: "Delete Coupon",
      text: "Do you want to delete this coupon? \nThis cannot be undo!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes,Delete",
      cancelButtonText: "DISMISS",
    });

    if (result.value) {
      const response = await fetch(`/admin/deleteCoupon?couponId=${couponId}`, {
        method: "POST",
      });

      const data = await response.json();

      if ((data.message = "success")) {
        Swal.fire({
          icon: "success",
          title: "Coupon has been deleted successfully",
          showConfirmButton: true,
          confirmButtonText: "OK",
          confirmButtonColor: "#4CAF50",
        });
        document.getElementById("couponRow" + couponId).innerHTML = "";
      } else {
        Swal.fire({
          icon: "error",
          title: "Somthing error!!",
          showConfirmButton: true,
          confirmButtonText: "DISMISS",
          confirmButtonColor: "#D22B2B",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const blockCoupon = async (couponId) => {
  try {
    const result = await Swal.fire({
      title: "Block Coupon",
      text: "Do you want to block this coupon?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Block",
      cancelButtonText: "DISMISS",
    });

    if (result.value) {
      const response = await fetch(`/admin/blockCoupon?couponId=${couponId}`, {
        method: "POST",
      });

      const data = await response.json();

      if ((data.message = "success")) {
        const result = await Swal.fire({
          icon: "success",
          title: "Coupon has been blocked successfully",
          showConfirmButton: true,
          confirmButtonText: "OK",
          confirmButtonColor: "#4CAF50",
        });

        if (result.value) {
          location.reload();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Somthing error!!",
          showConfirmButton: true,
          confirmButtonText: "DISMISS",
          confirmButtonColor: "#D22B2B",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

/////////////// DASHBOARD DATA ////////////////////


let months;
let ordersByMonth;
let revenueByMonth;
let orderData;
let categorySalesData; // Define categorySalesData at a global scope
let paymentMethodSalesData; // Define paymentMethodSalesData at a global scope
/////////////// Graph data ////////////////////


if (window.location.pathname === "/admin/dashboard") {
  // Move the Chart rendering code inside the window.onload event listener
  window.onload = function () {
    // Place your existing JavaScript code here
    // ...

    const getChartData = async () => {
      const response = await fetch("/admin/chartData", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      months = data.months;
      ordersByMonth = data.ordersByMonth;
      revenueByMonth = data.revenueByMonth;
      categorySalesData = data.categorySalesData; // Assign categorySalesData from data
      paymentMethodSalesData = data.paymentMethodSalesData; // Assign paymentMethodSalesData from data

      
     
      salesGraph(months, ordersByMonth);
      revenue(months, data.revenueByMonth);
      categoryDonut(data.categorySalesData);
      paymentMethodDonut(data.paymentMethodSalesData);
    };

   

 

    function salesGraph(months, ordersByMonth) {
      const ctx = document.getElementById("myChart");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: months,
          datasets: [
            {
              label: "# of sales",
              data: ordersByMonth,
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    function revenue(months, revenueByMonth) {
      const ctx1 = document.getElementById("myChart1");
      new Chart(ctx1, {
        type: "line",
        data: {
          labels: months,
          datasets: [
            {
              label: "# Revenue",
              data: revenueByMonth,
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    function categoryDonut(categorySalesData) {
      const ctx = document.getElementById("categoryChart");
      new Chart(ctx, {
          type: "doughnut",
          data: {
              labels: categorySalesData.map(category => category.category),
              datasets: [
                  {
                      label: "Category Sales",
                      data: categorySalesData.map(category => category.totalSales),
                      backgroundColor: generateColors(categorySalesData.length),
                  },
              ],
          },
      });
  }

  function paymentMethodDonut(paymentMethodSalesData) {
    const ctx = document.getElementById("paymentMethodChart");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(paymentMethodSalesData),
            datasets: [
                {
                    label: "Payment Method Sales",
                    data: Object.values(paymentMethodSalesData).map(method => method.totalSales),
                    backgroundColor: generateColors(Object.keys(paymentMethodSalesData).length),
                },
            ],
        },
    });
}

function generateColors(count) {
  // This function generates an array of random colors
  const colors = [];
  for (let i = 0; i < count; i++) {
      colors.push(getRandomColor());
  }
  return colors;
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
    // Call the getChartData function after the DOM has fully loaded
    getChartData();
  };
}



/////////////// Sales report ////////////////////

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate());
const maxDate = tomorrow.toISOString().split("T")[0];

if (startDateInput && endDateInput) {
  startDateInput.setAttribute("max", maxDate);
  endDateInput.setAttribute("min", startDateInput.value);
  endDateInput.setAttribute("max", maxDate);
}

var startDateField = document.getElementById("start-date");
var endDateField = document.getElementById("end-date");

if (startDateField && endDateField) {
  startDateField.addEventListener("change", function () {
    endDateField.setAttribute("min", startDateField.value);
  });

  endDateField.addEventListener("change", function () {
    startDateField.setAttribute("max", endDateField.value);
  });
}

///////////sales report//////////



    // async function generateSalesReportPDF() {
    //     try {
    //         console.log(433, "generateSalesReport");
    //         const startDate = document.getElementById("start-date").value;
    //         const endDate = document.getElementById("end-date").value;

    //         // Send a request to the server to generate the PDF
    //         const response = await fetch(`/admin/generateSalesReport?startDate=${startDate}&endDate=${endDate}`);
    //         console.log(439, "generateSalesReport", response);
            
    //         if (!response.ok) {
    //             throw new Error("PDF generation failed");
    //         }
            
    //         const blob = await response.blob();
    //         console.log(441, "generateSalesReport", blob);

    //         // Create a URL for the blob
    //         const blobUrl = URL.createObjectURL(blob);
    //         console.log(444, "generateSalesReport", blobUrl);

    //         // Open the PDF in a new tab
    //         window.open(blobUrl, "_blank");
    //     } catch (error) {
    //         console.error("Error generating PDF:", error);
    //     }
    // }

    // document.getElementById("sales-report-form").addEventListener("submit", function(event) {
    //     console.log(448, "salesReport");
    //     event.preventDefault();
    //     generateSalesReportPDF();
    // });

    let startDate
    let endDate

    
    async function generateSalesReportPDF() {
      console.log(472);
        startDate = document.getElementById("start-date").value;
        endDate = document.getElementById("end-date").value;
        console.log(startDate, endDate);
 

 function renderSalesReport(orderData) {
   console.log(374, orderData)
  //  const salesReportHTML = ejs.render(salesReportTemplate, { data: orderData });
   document.getElementById("table").innerHTML = orderData;
 
  //  jQuery(document).ready(function ($) {
  //    $("#my-table").DataTable({
  //      dom: "Bfrtip",
  //      buttons: ["excelHtml5", "pdfHtml5"],
  //    });
  //  });
 }
    
    
        ///////////sales report fetch///////////
    console.log(388);
        const response = await fetch(`/admin/generateSalesReport?startDate=${startDate}&endDate=${endDate}`, {
            headers: { "Content-Type": "application/json" },
        });
    console.log(553,response);
        data = await response.json();
        console.log(data)
        if (data) {
          console.log(396)
            renderSalesReport(data.data);
        }
    }
    


   




    const downloadSalesReport = async () => {
      try {
        console.log(516,"downloadsalesreport");
        const response = await fetch(`/admin/downloadSalesReport?startDate=${startDate}&endDate=${endDate}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderData: orderData,
          }),
        });
    console.log(526,response);
        const blobData = await response.blob();
        console.log("blobbbbbb")
        const url = URL.createObjectURL(blobData);
        const link = document.createElement("a");
        link.href = url;
        link.download = `SalesReport.pdf`;
        link.click();
    
        URL.revokeObjectURL(url);
      } catch (error) {
        console.log(error.message);
      }
    };