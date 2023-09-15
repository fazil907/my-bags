// updating cart on the server(db)

const updateCartOnServer = async (datas) => {
  try {
    const response = await fetch("/cartUpdation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        datas,
      }),
    });

    if (response.ok) {
      console.log("Cart updated on the server.");
    } else {
      console.error("Failed to update cart on the server.");
    }
  } catch (error) {
    console.error("Error updating cart:", error);
  }
};


///total price

const totalPrice = async (id, act, stock) => {
  const elem = document.getElementById(id);
  if (act == "inc") {
    elem.value ? (elem.value = Number(elem.value) + 1) : "";
  } else if (act == "decs") {
    elem.value > 1 ? (elem.value = Number(elem.value) - 1) : "";
  }
  const response= handleIncreaseButtonClick(id, stock); 
  let subTotal = 0;
  let datas = [];
  let length = document.getElementsByName("productTotal").length;

  for (let i = 0; i < length; i++) {
    const quantity = parseFloat(
      document.getElementsByName("num-product")[i].value
    );

    const price = parseFloat(
      document.getElementsByName("productprice")[i].value
    );

    const productTotal = isNaN(quantity) || isNaN(price) ? 0 : quantity * price;

    document.getElementsByName("productTotal")[i].innerText =
      "₹ " + productTotal.toFixed();
    subTotal += productTotal;

    datas.push({
      id: document.getElementsByName("productId")[i].value,
      quantity: Number(document.getElementsByName("num-product")[i].value),
    });
  }

  document.getElementById("subTotal").innerText = "₹ " + subTotal.toFixed();
  document.getElementById("subTotal2").innerText = "₹ " + subTotal.toFixed();

  updateCartOnServer(datas);
};


// get stock
async function handleIncreaseButtonClick(productId) {
  try {
    console.log(21212)
    const response = await fetch(
      `/getStock?productId=${productId}`
    );
    const stockData = await response.json();
  

    const quantityElement = document.getElementById(productId);


    const quantity = parseFloat(quantityElement.value);


    const stock = stockData.stock;
 
    if (quantity + 1 <= stock) {
       return 1
      // Update the total price and other UI elements
    } else {
      Swal.fire({
        icon: "error",
        title: "Out of stock",
        text: "The selected quantity is not available.",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error(error);
  }
}


// remove cart

const removeCartalert = async (id) => {
  const productId = document.getElementById("product_id" + id).value;

  const cartId = document.getElementById("cart_id").value;

  const idObj = { proId: productId, cartId: cartId };

  const result = await Swal.fire({
    title: "Remove item from cart",
    text: "Do you want to remove this product from your cart?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Cancel",
    cancelButtonText: "Yes, remove",
    showDenyButton: false,
  });

  if (result.dismiss === Swal.DismissReason.cancel) {
    removeFromCart(productId, cartId);
  }
};  


//// Remove from Cart

const removeFromCart = async (productId, cartId) => {
  const response = await fetch(`/removeFromCart?productId=${productId}&cartId=${cartId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.ok) {
    Swal.fire({
      icon: "success",
      title: "Product has been removed successfully",
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#4CAF50",
    });
    document.getElementById("row" + productId).innerHTML = "";
  }
};

addressForm.addEventListener("submit", async function (event) {
  const addressForm = document.getElementById("addressForm");

  event.preventDefault();

  const formData = new FormData(event.target);

  resetErrorMessage();
  try {
    const response = await axios.post("/addNewAddress", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      const result = await Swal.fire({
        icon: "success",
        title: "Successfully added new address",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4CAF50",
      });
      if (result.value) {
        form.reset();
        location.reload();
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
    if (error.response.status === 400) {
      const validationErrors = error.response.data.error;
      Object.keys(validationErrors).forEach((key) => {
        document.getElementById(key).textContent = validationErrors[key];
      });
    } else {
      alert("something went wrong");
    }
  }
});

function resetErrorMessage() {
  const errorElements = document.querySelectorAll(".error-msg");
  errorElements.forEach((element) => {
    element.textContent = "";
  });
}



///// Placing Order

const placeOrder = async () => {
  console.log(165);
  try {
    const selectedPayment = document.querySelector(
      ".payment-radio:checked"
    ).value;
console.log(170,selectedPayment);
    if (selectedPayment === "Cash On Delivery") {
      cashOnDelivery(selectedPayment);
    } else if (selectedPayment === "Razorpay") {
      razorpay(selectedPayment);
    } else if (selectedPayment === "Wallet") {
      wallet(selectedPayment);
    }
  } catch (error) {
    console.log(error);
  }
};


// Cash on Delivery

const cashOnDelivery = async (selectedPayment, updatedBalance) => {
  try {
    console.log(185);
    const selectedAddress = document.querySelector(
      'input[name="selectedAddress"]:checked'
    ).value;
    console.log(189,selectedAddress);
    const subTotal = Number(document.getElementById("subTotalValue").value);
console.log(191,subTotal);
    const response = await fetch("/placeOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selectedAddress: selectedAddress,
        selectedPayment: selectedPayment,
        amount: subTotal,
        walletBalance: updatedBalance,
        couponData: couponData,
      }),
    });
    console.log(197,response);

    const orderConfirmData = await response.json();

    if (orderConfirmData.order === "Success") {
      window.location.href = "/orderSuccess";
    }
  } catch (error) {
    console.log(error.message);
  }
};

function updateWalletBalanceOnUI(newBalance) {
  console.log(322);
  const walletBalanceElement = document.getElementById("userWallet");
  console.log(324,walletBalanceElement);
  walletBalanceElement.value = newBalance; // Update the input value
  
}

const wallet = async (selectedPayment) => {
  try {
    const balance = document.getElementById("userWallet").value;
    const subTotal = Number(document.getElementById("subTotalValue").value);
    const insufficientBalanceAlert = document.getElementById(
      "insufficientBalanceAlert"
    );

    if (balance > subTotal) {
      const updatedBalance = balance - subTotal;
      cashOnDelivery(selectedPayment, updatedBalance); 
    } else {
      insufficientBalanceAlert.classList.remove("d-none");
      insufficientBalanceAlert.classList.add("d-flex");
    }
  } catch (error) {
    console.log(error.message);
  }
};

window.addEventListener("load", function () {
  const insufficientBalanceAlert = document.getElementById(
    "insufficientBalanceAlert"
  );
  if (insufficientBalanceAlert) {
    insufficientBalanceAlert.classList.remove("d-flex");
    insufficientBalanceAlert.classList.add("d-none");
  }
});

const closeButton = document.querySelector(".btn-close");
if (closeButton) {
  closeButton.addEventListener("click", function () {
    const insufficientBalanceAlert = document.getElementById(
      "insufficientBalanceAlert"
    );
    insufficientBalanceAlert.classList.remove("d-flex");
    insufficientBalanceAlert.classList.add("d-none");
  });
}

const addressRadios = document.querySelectorAll(
  'input[name="selectedAddress"]'
);
const paymentRadios = document.querySelectorAll(".payment-radio");
const placeOrderBtn = document.getElementById("place-order-btn");

addressRadios.forEach((radio) => {
  radio.addEventListener("change", handleAddressSelection);
});

paymentRadios.forEach((radio) => {
  radio.addEventListener("change", handleAddressSelection);
});

function handleAddressSelection() {
  const selectedAddress = document.querySelector(
    'input[name="selectedAddress"]:checked'
  );
  const selectedPayment = document.querySelector(".payment-radio:checked");

  if (selectedAddress && selectedPayment) {
    placeOrderBtn.disabled = false;
  } else {
    placeOrderBtn.disabled = true;
  }
}


// Razorpay

const razorpay = async (selectedPayment) => {
  try {
    const subTotal = Number(document.getElementById("subTotalValue").value);

    var options = {
      key: "rzp_test_tsXrFaxO9oaxTP", // Enter the Key ID generated from the Dashboard
      amount: subTotal * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "MY BAGS",
      description: "Order payment",
      image: "",
      order_id: undefined, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: function (response) {
        cashOnDelivery(selectedPayment);
      },
      theme: {
        color: "#3399cc",
      },
    };

    var rzp1 = new Razorpay(options);

    rzp1.open();
  } catch (error) {
    console.log(error.message);
  }
};


/// coupon validate

let coupon;
let couponData;
let couponDeleteSubtotal = null;

let subtotalElement = document.getElementById("subTotalValue");

if (subtotalElement) {
  couponDeleteSubtotal = Number(subtotalElement.value);
}

const inputField = document.getElementById("checkout-discount-input");

if (inputField) {
  inputField.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });
}

function selectCoupon(code) {
  const inputField = document.getElementById("checkout-discount-input");
  inputField.value = code;
  inputField.style.backgroundColor = code ? "white" : "";
  // You can also perform additional actions with the discount value if needed
}

const validateCoupon = async () => {  
  console.log(311)
  coupon = document.getElementById("checkout-discount-input").value;
  const subTotal = Number(document.getElementById("subTotalValue").value);
  console.log(314 , coupon , subTotal)

  const response = await fetch("/validateCoupon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      coupon: coupon,
      subTotal: subTotal,
    }),
  });

  couponData = await response.json();

  console.log(330 , couponData)


  const couponModel = document.getElementById("couponModel");
  const couponDiscount = document.getElementById("couponDiscount");
  const couponMessage = document.getElementById("couponMessage");

  const subTotalElement = document.getElementById("subTotal");
  const subTotalText = document.getElementById("subTotalText");

  if (couponData === "invalid") {
    Swal.fire({
      icon: "error",
      title: "INVALID COUPON CODE",
      showConfirmButton: true,
      confirmButtonText: "DISMISS",
      confirmButtonColor: "#4CAF50",
    });
  } else if (couponData === "expired") {
    Swal.fire({
      icon: "warning",
      title: "COUPON IS EXPIRED",
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#4CAF50",
    });
  } else if (couponData === "already used") {
    Swal.fire({
      icon: "warning",
      title: "ALREADY USED",
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#4CAF50",
    });
  } else if (couponData === "minimum value not met") {
    Swal.fire({
      icon: "warning",
      title: "COUPON CAN'T BE APPLIED",
      text: "We're sorry, the minimum order value to apply the coupon has not been met.",
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#4CAF50",
    });
  } else {
    console.log(369)
    if (couponData.maximum === "maximum") {
      Swal.fire({
        icon: "success",
        title: `"${coupon}" APPLIED SUCCESSFULLY!!`,
        html: `<strong>Maximum discount </strong>for this coupon is <strong style="color: green;" >₹ ${couponData.discountAmount}</strong>, and you have reached the maximum discount limit!`,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4CAF50",
      });
    } else{
      console.log(380)
      Swal.fire({
        icon: "success",
        title: `"${coupon}" APPLIED SUCCESSFULLY!!`,
        html: `You have received a discount of <strong style="color: green;" >₹ ${couponData.discountAmount}</strong>.<br>Enjoy your savings!`,
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#4CAF50",
      });
    }

    console.log(369)


    if (couponData.maximum === "maximum") {
      couponMessage.innerHTML = "Maximum Coupon Discount:";
    }
    couponModel.style.display = "table-row";
    couponDiscount.innerHTML = `₹ ${couponData.discountAmount}`;

    subTotalElement.innerHTML = `₹ ${couponData.newTotal}`;
    subTotalText.innerHTML = "Total After Coupon Discount:";
    document.getElementById("subTotalValue").value = couponData.newTotal;

    $("#couponIcon")
      .removeClass("icon-long-arrow-right")
      .addClass("fa-regular fa-trash-can p-1");

    $("#couponButton").attr("onclick", "couponDelete()");
  }
};

couponDelete = async () => {
  const result = await Swal.fire({
    title: `Do you want to remove the coupon "${coupon}"?`,
    html: `By doing so, you will lose the discount amount <strong style="color: green;" >₹ ${couponData.discountAmount}</strong> associated with the coupon. Please confirm your decision`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Remove",
    cancelButtonText: "DISMISS",
  });

  if (result.value) {
    const couponModel = document.getElementById("couponModel");
    const subTotalText = document.getElementById("subTotalText");
    const subTotalElement = document.getElementById("subTotal");
    const subTotalValue = document.getElementById("subTotalValue");

    couponModel.style.display = "none";
    subTotalText.innerHTML = "Grand Total:";
    subTotalElement.innerHTML = `₹ ${couponDeleteSubtotal}`;
    subTotalValue.value = couponDeleteSubtotal;

    $("#couponIcon")
      .removeClass("fa-regular fa-trash-can p-1")
      .addClass("icon-long-arrow-right");

    $("#couponButton").attr("onclick", "validateCoupon()");

    Swal.fire({
      icon: "success",
      title: `"${coupon}" REMOVED SUCCESSFULLY!!`,
      html: `The applied coupon has been successfully removed. The discount associated with the coupon has been removed as well`,
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#4CAF50",
    });
  }
};



