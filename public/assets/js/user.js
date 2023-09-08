async function sortProducts(category) {
  console.log(7);
  const categoryData = category;

  const selectElement = document.getElementById("sortOptions");
  const selectedValue = selectElement.value;

  if (selectedValue === "relevent") {
    location.reload();
  } else {
    const response = await fetch("/sortProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sort: selectedValue,
        categoryId: categoryData,
      }),
    });

    const data = await response.json();

    filteredData(data);
  }
}

