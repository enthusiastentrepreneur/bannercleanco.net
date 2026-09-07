/* ==========================================================================
   Banner Clean Co. — booking cart + WhatsApp checkout
   Add a button anywhere on the page with:  data-add="service_id"
   and the service will be added to the booking cart.
   ========================================================================== */
(function () {
  "use strict";

  var BUSINESS_WHATSAPP_NUMBER = "353899721947"; // +353 89 972 1947, no leading 0, no plus/spaces

  // ---- Bookable services & add-ons -----------------------------------
  // Edit prices/names here any time — everything else updates automatically.
  var SERVICES = [
    { id: "std-1bed",   name: "Standard Clean – Studio / 1 Bed",        price: 45 },
    { id: "std-3bed",   name: "Standard Clean – 2–3 Bed",                price: 65 },
    { id: "std-4bed",   name: "Standard Clean – 4+ Bed",                 price: 85 },
    { id: "deep-1bed",  name: "Deep Clean – Studio / 1 Bed",             price: 80 },
    { id: "deep-3bed",  name: "Deep Clean – 2–3 Bed",                    price: 120 },
    { id: "deep-4bed",  name: "Deep Clean – 4+ Bed",                     price: 160 },
    { id: "turn-1bed",  name: "Holiday-Let Turnover – Studio / 1 Bed",   price: 40 },
    { id: "turn-3bed",  name: "Holiday-Let Turnover – 2–3 Bed",          price: 55 },
    { id: "eot-1bed",   name: "End-of-Tenancy Clean – Studio / 1 Bed",   price: 95 },
    { id: "eot-3bed",   name: "End-of-Tenancy Clean – 2–3 Bed",          price: 140 },
    { id: "add-linen",  name: "Add-on: Linen Change & Fresh Towels",     price: 15 },
    { id: "add-oven",   name: "Add-on: Inside-Oven Clean",               price: 20 },
    { id: "add-windows",name: "Add-on: Inside Windows (ground floor)",   price: 15 },
    { id: "bundle-turnover-linen", name: "Bundle: Turnover Clean + Linen Change (2–3 Bed)", price: 62 },
    { id: "bundle-starter", name: "Bundle: New Host Starter — 3 Turnover Cleans (1–3 Bed)", price: 135 }
  ];

  function svc(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; return null; }
  function fmtMoney(n) { return "€" + n.toFixed(2).replace(/\.00$/, ""); }

  var state = { cart: {} }; // { serviceId: qty }

  function cartCount() {
    var n = 0;
    for (var id in state.cart) n += state.cart[id];
    return n;
  }
  function cartTotal() {
    var t = 0;
    for (var id in state.cart) { var s = svc(id); if (s) t += s.price * state.cart[id]; }
    return t;
  }

  function addToCart(id) {
    if (!svc(id)) return;
    state.cart[id] = (state.cart[id] || 0) + 1;
    renderCartBadgeAndBar();
  }
  function setQty(id, qty) {
    if (qty <= 0) { delete state.cart[id]; } else { state.cart[id] = qty; }
    renderCartBadgeAndBar();
    renderCartModal();
  }

  function renderCartBadgeAndBar() {
    var count = cartCount();
    var badge = document.getElementById("cartBadge");
    if (badge) { badge.textContent = count; badge.style.display = count ? "flex" : "none"; }

    var bar = document.getElementById("cartBar");
    if (bar) {
      if (count > 0) {
        bar.classList.add("show");
        document.getElementById("cartBarCount").textContent = count + (count === 1 ? " item" : " items");
        document.getElementById("cartBarTotal").textContent = fmtMoney(cartTotal());
      } else {
        bar.classList.remove("show");
      }
    }
  }

  function renderCartModal() {
    var wrap = document.getElementById("cartLines");
    if (!wrap) return;
    var ids = Object.keys(state.cart).filter(function (id) { return state.cart[id] > 0; });

    if (!ids.length) {
      wrap.innerHTML = '<p class="cart-empty">Your booking is empty. Add a clean or bundle to get started.</p>';
      document.getElementById("toCheckoutBtn").disabled = true;
    } else {
      document.getElementById("toCheckoutBtn").disabled = false;
      wrap.innerHTML = ids.map(function (id) {
        var s = svc(id), qty = state.cart[id];
        return (
          '<div class="cart-line">' +
            '<div style="flex:1">' +
              '<div class="cart-line-name">' + s.name + '</div>' +
              '<div class="cart-line-price">' + fmtMoney(s.price) + ' × ' + qty + ' = ' + fmtMoney(s.price * qty) + '</div>' +
            '</div>' +
            '<div class="qty-stepper">' +
              '<button type="button" data-dec="' + id + '" aria-label="Decrease quantity">−</button>' +
              '<span>' + qty + '</span>' +
              '<button type="button" data-inc="' + id + '" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="cart-line-remove" data-remove="' + id + '">Remove</button>' +
          '</div>'
        );
      }).join("");
    }

    document.getElementById("cartSubtotal").textContent = fmtMoney(cartTotal());
    document.getElementById("cartGrandTotal").textContent = fmtMoney(cartTotal());

    wrap.querySelectorAll("[data-inc]").forEach(function (btn) {
      btn.addEventListener("click", function () { var id = btn.getAttribute("data-inc"); setQty(id, (state.cart[id] || 0) + 1); });
    });
    wrap.querySelectorAll("[data-dec]").forEach(function (btn) {
      btn.addEventListener("click", function () { var id = btn.getAttribute("data-dec"); setQty(id, (state.cart[id] || 0) - 1); });
    });
    wrap.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () { setQty(btn.getAttribute("data-remove"), 0); });
    });
  }

  /* ---------------- Add-to-booking buttons ---------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (btn) { addToCart(btn.getAttribute("data-add")); btn.textContent = "Added ✓"; setTimeout(function () { btn.textContent = btn.getAttribute("data-label") || "Add to booking"; }, 1200); }
  });

  /* ---------------- Modals ---------------- */
  function openOverlay(id) { var el = document.getElementById(id); if (el) el.classList.add("show"); }
  function closeOverlay(id) { var el = document.getElementById(id); if (el) el.classList.remove("show"); }

  document.addEventListener("DOMContentLoaded", function () {
    var openBtns = document.querySelectorAll("#openCartBtn, #cartBarBtn");
    openBtns.forEach(function (b) { b.addEventListener("click", function () { renderCartModal(); openOverlay("cartOverlay"); }); });

    document.querySelectorAll("[data-close]").forEach(function (btn) {
      btn.addEventListener("click", function () { closeOverlay(btn.getAttribute("data-close")); });
    });

    var toCheckout = document.getElementById("toCheckoutBtn");
    if (toCheckout) toCheckout.addEventListener("click", function () { closeOverlay("cartOverlay"); openOverlay("checkoutOverlay"); });

    var backToCart = document.getElementById("backToCartBtn");
    if (backToCart) backToCart.addEventListener("click", function () { closeOverlay("checkoutOverlay"); renderCartModal(); openOverlay("cartOverlay"); });

    var newOrderBtn = document.getElementById("newOrderBtn");
    if (newOrderBtn) newOrderBtn.addEventListener("click", function () { state.cart = {}; renderCartBadgeAndBar(); renderCartModal(); closeOverlay("confirmOverlay"); });

    ["cartOverlay", "checkoutOverlay", "confirmOverlay"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("click", function (e) { if (e.target === e.currentTarget) closeOverlay(id); });
    });

    var form = document.getElementById("orderForm");
    if (form) form.addEventListener("submit", handleSubmit);

    renderCartBadgeAndBar();
    renderCartModal();
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* ---------------- Order number ---------------- */
  function generateOrderNumber() {
    var d = new Date();
    var y = String(d.getFullYear()).slice(-2);
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    var rand = String(Math.floor(100 + Math.random() * 900));
    return "BCC-" + y + m + day + "-" + rand;
  }

  /* ---------------- WhatsApp message ---------------- */
  function buildWhatsAppMessage(order) {
    var lines = [];
    lines.push("*New booking " + order.number + " — Banner Clean Co.*");
    lines.push("");
    lines.push("Name: " + order.firstName + " " + order.lastName);
    lines.push("Phone: " + order.phone);
    lines.push("Property address: " + order.address);
    lines.push("Preferred date: " + (order.date || "Not specified"));
    if (order.notes) lines.push("Notes: " + order.notes);
    lines.push("");
    lines.push("Services requested:");
    order.items.forEach(function (it) {
      lines.push("- " + it.qty + " x " + it.name + " — " + fmtMoney(it.qty * it.price));
    });
    lines.push("");
    lines.push("Estimated total: " + fmtMoney(order.total));
    return lines.join("\n");
  }

  /* ---------------- Form validation & submit ---------------- */
  function setFieldError(name, show) {
    var field = document.querySelector('[data-field="' + name + '"]');
    if (field) field.classList.toggle("error", !!show);
  }
  function validatePhone(v) { var digits = v.replace(/[^0-9]/g, ""); return digits.length >= 8; }

  function handleSubmit(e) {
    e.preventDefault();
    var firstName = document.getElementById("firstName").value.trim();
    var lastName = document.getElementById("lastName").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var address = document.getElementById("address").value.trim();
    var date = document.getElementById("date").value.trim();
    var notes = document.getElementById("notes").value.trim();

    var valid = true;
    [["firstName", firstName], ["lastName", lastName], ["address", address]].forEach(function (pair) {
      var ok = pair[1].length > 0;
      setFieldError(pair[0], !ok);
      if (!ok) valid = false;
    });
    var phoneOk = phone.length > 0 && validatePhone(phone);
    setFieldError("phone", !phoneOk);
    if (!phoneOk) valid = false;

    if (!valid) return;

    var ids = Object.keys(state.cart).filter(function (id) { return state.cart[id] > 0; });
    if (!ids.length) return;

    var items = ids.map(function (id) {
      var s = svc(id);
      return { name: s.name, qty: state.cart[id], price: s.price };
    });

    var order = {
      number: generateOrderNumber(),
      firstName: firstName, lastName: lastName, phone: phone, address: address, date: date, notes: notes,
      items: items, total: cartTotal()
    };

    var message = buildWhatsAppMessage(order);
    var url = "https://wa.me/" + BUSINESS_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");

    document.getElementById("confirmOrderNumVal").textContent = order.number;
    closeOverlay("checkoutOverlay");
    openOverlay("confirmOverlay");

    document.getElementById("orderForm").reset();
    ["firstName", "lastName", "phone", "address"].forEach(function (n) { setFieldError(n, false); });
  }
})();
