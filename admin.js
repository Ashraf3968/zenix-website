async function checkAdmin() {
  const res = await fetch("/api/me")
  if (res.status !== 200) {
    document.body.innerHTML = "❌ Access Denied"
    return
  }

  document.getElementById("status").innerText = "✅ Admin Verified"
  document.getElementById("panel").style.display = "block"
}

async function addProduct() {
  const name = document.getElementById("name").value
  const price = document.getElementById("price").value

  await fetch("/api/add-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price })
  })

  alert("Product added")
}

checkAdmin()
