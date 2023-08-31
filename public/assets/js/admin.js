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

            if ((data.message == "Success")) {
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

const addCouponForm = document.getElementById("addCoupon")

if(addCouponForm){
  addCouponForm.addEventListener("submit", async function (event){
      event.preventDefault()

      const form = event.target;
      const formData = new FormData(form)

      try {
        const response = await fetch("/admin/addCoupon",{
          method : "POST",
          body : JSON.stringify(Object.fromEntries(formData)),
          headers : {
            "Content-Type" : "application/json"
          }
        })

        const data = await response.json()

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
        console.log(error)
      }
  })
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

let months
let ordersByMonth
let revenueByMonth
let orderData


/////////////// Graph data ////////////////////



if (window.location.pathname === '/admin/dashboard') {
  // Move the Chart rendering code inside the window.onload event listener
window.onload = function() {
  // Place your existing JavaScript code here
  // ...

  const getChartData = async()=>{
    const response = await fetch('/admin/chartData',{
      headers:{
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log(data);

    months = data.months
    ordersByMonth = data.ordersByMonth
    revenueByMonth = data.revenueByMonth

    salesGraph(months, ordersByMonth)
    revenue(months, data.revenueByMonth)
  }


  function salesGraph(months, ordersByMonth) {
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: '# of sales',
          data: ordersByMonth,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function revenue(months, revenueByMonth) {
    const ctx1 = document.getElementById('myChart1');
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: '# Revenue',
          data: revenueByMonth,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Call the getChartData function after the DOM has fully loaded
  getChartData();
};
}