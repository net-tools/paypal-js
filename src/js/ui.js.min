'use strict';if("object"!=typeof NTPaypal)throw Error("client.js script is mandatory and a dependency of ui.js");if("function"!=typeof NTPaypal.Store)throw Error("store.js script is mandatory and a dependency of ui.js");if("object"!=typeof CryptoJS)throw Error("js-core.js from net-tools/js-core package is mandatory and a dependency of ui.js");
NTPaypal.i18n={ui:{SECTION1_CART:{product:"Product",quantity:"Quantity",price:"Price per unit",total:"Total",with_vat:"VAT incl.",vat_amount:"VAT amount",btn_toShipping:"Validate cart and go to shipping details",stock_issue:"Can't add another item of that product because the shop stock is not enough"},SECTION2_SHIPPING:{firstname:"Firstname",surname:"Surname",address1:"Address",address2:"Building, Appt n\u00b0...",zipcode:"Zipcode",city:"City",country:"Country",email:"Email",phone:"Phone number",
btn_backToCart:"Back to cart",btn_toConfirm:"Review order and pay",regexp_zipcode:"^[0-9]{5}(?:-[0-9]{4})?$",regexp_phone:"^\\d{10}$"},SECTION3_CONFIRM:{carrier:"Please choose a carrier from the following list box",shipping:"For a delivery at the address below, the shipping cost is",shipping_nocarrier:"[--Please choose carrier first--]",carrier_select:"Please choose a carrier before clicking on 'Pay now' button",intro:"You are about to place an order for your shopping cart",total:"total (shipping incl.)",
recipient:"Your order will be sent to this address",agreement:"By ticking the checkbox, you agree to the Terms of Sales and accept to pay for the items purchased",btn_backToCart:"Back to cart",btn_backToShipping:"Update shipping details",btn_pay:"Pay now",tos_accept:"You have to accept Terms of Sales before clicking on 'Pay now' button",payment_error:"No payment received, you may try again",payment_received:"Your payment has been confirmed. Thanks."}}};
NTPaypal.UI=function(b,e,d){d=d||{};this.container=document.querySelector(b);this.section3_confirm=this.section2_shipping=this.section1_cart=null;this.sections=[];if(!this.container)throw Error("Selector '"+b+"' doesn't match any tag in document");if(!(e instanceof NTPaypal.Session))throw new TypeError("'session' parameter of 'UI' constructor method is not an instance of 'Session'");if(d.onCountries&&"function"!=typeof d.onCountries)throw new TypeError("'params.onCountries' parameter of 'UI' constructor method is not function");
if(d.onShippingCost&&"function"!=typeof d.onShippingCost)throw new TypeError("'params.onShippingCost' parameter of 'UI' constructor method is not function");if(d.onPaymentReceived&&"function"!=typeof d.onPaymentReceived)throw new TypeError("'params.onPaymentReceived' parameter of 'UI' constructor method is not function");if(d.onPaymentCompleted&&"function"!=typeof d.onPaymentCompleted)throw new TypeError("'params.onPaymentCompleted' parameter of 'UI' constructor method is not function");if(d.onCustomMessage&&
"function"!=typeof d.onCustomMessage)throw new TypeError("'params.onCustomMessage' parameter of 'UI' constructor method is not function");this.session=e;this.onCountries=d.onCountries;this.onPaymentReceived=d.onPaymentReceived;this.onPaymentCompleted=d.onPaymentCompleted;this.onShippingCost=d.onShippingCost;this.onCustomMessage=d.onCustomMessage;"string"==typeof d.TOSLink&&(d.TOSLink={url:d.TOSLink});this.TOSLink=d.TOSLink};
NTPaypal.UI.prototype.show=function(){function b(w){k.forEach(function(l){l.style.display="none"});w.style.display="block"}function e(){b(t)}function d(){b(u)}var u=this.section1_cart=document.createElement("SECTION"),t=this.section2_shipping=document.createElement("SECTION"),c=this.section3_confirm=document.createElement("SECTION"),k=this.sections=[u,t,c];u.id="NTPP_S_Cart";t.id="NTPP_S_Shipping";c.id="NTPP_S_Confirm";var m=null,n=null,y=null;this.container.innerHTML="";m=new NTPaypal.UI.Section1_Cart(u,
this.session,e);n=new NTPaypal.UI.Section2_Shipping(t,d,function(){y.update();b(c)},this.onCountries);y=new NTPaypal.UI.Section3_Confirm(c,this.session,n,d,e,this.TOSLink,this.onShippingCost,this.onCustomMessage,this.onPaymentReceived,this.onPaymentCompleted);m.render();n.render();y.render();this.sections.forEach(function(w){w.style.display="none";this.container.appendChild(w)},this);d()};
NTPaypal.UI.Section1_Cart=function(b,e,d){function u(k){t.call(this,k,-1)}function t(k,m){m=m||1;k=this.getAttribute("data-sku");try{e.store.updateCartQuantity(k,m,e.cart)?e.save():alert(NTPaypal.i18n.ui.SECTION1_CART.stock_issue),c()}catch(n){_error(n)}}function c(){b.innerHTML=`<table id="NTPP_S_Cart_Content">
	<thead>
		<tr>
			<th>${NTPaypal.i18n.ui.SECTION1_CART.product}</th>
			<th>${NTPaypal.i18n.ui.SECTION1_CART.quantity}</th>
			<th>${NTPaypal.i18n.ui.SECTION1_CART.price}</th>
			<th>${NTPaypal.i18n.ui.SECTION1_CART.total} ${NTPaypal.i18n.ui.SECTION1_CART.with_vat}</th>
		</tr>
	</thead>
	<tbody>
	</tbody>
	<tfoot>
		<tr>
			<td></td><td></td><td></td><td id="NTPP_S_Cart_Content_Total"></td>
		</tr>
		<tr id="NTPP_S_Cart_Content_TaxLine">
			<td></td><td></td><td>${NTPaypal.i18n.ui.SECTION1_CART.vat_amount}</td><td id="NTPP_S_Cart_Content_Tax"></td>
		</tr>
	</tfoot>
</table>
<div class="NTTP_buttons">
	<input type="button" value="${NTPaypal.i18n.ui.SECTION1_CART.btn_toShipping}">
</div>`;var k=b.firstChild,m=k.querySelector("tbody");m.innerHTML="";var n=e.cart.getContent(),y=0,w=0;n.forEach(function(l){var z=document.createElement("TR"),p=document.createElement("TD");p.innerHTML=l.product.title;z.appendChild(p);p=document.createElement("TD");p.innerHTML='<a href="javascript:void(0)" data-sku="'+l.product.sku+'">-</a><span>'+l.quantity+'</span><a href="javascript:void(0)" data-sku="'+l.product.sku+'">+</a>';p.getElementsByTagName("a")[0].onclick=u;p.getElementsByTagName("a")[1].onclick=
t;z.appendChild(p);p=document.createElement("TD");p.innerHTML=Number.parseFloat(l.product.price+l.product.tax).toFixed(2)+" "+e.shop.currency_code;z.appendChild(p);p=document.createElement("TD");p.innerHTML=Number.parseFloat((l.product.price+l.product.tax)*l.quantity).toFixed(2)+" "+e.shop.currency_code;z.appendChild(p);y+=(l.product.price+l.product.tax)*l.quantity;w+=l.product.tax*l.quantity;m.appendChild(z)});k.querySelector("#NTPP_S_Cart_Content_Total").innerHTML=Number.parseFloat(y).toFixed(2)+
" "+e.shop.currency_code;0==w?k.querySelector("#NTPP_S_Cart_Content_TaxLine").style.display="none":k.querySelector("#NTPP_S_Cart_Content_Tax").innerHTML="("+Number.parseFloat(w).toFixed(2)+" "+e.shop.currency_code+")";0==n.length?b.lastChild.querySelector("input").disabled=!0:b.lastChild.querySelector("input").onclick=d}this.render=c};
NTPaypal.UI.Section2_Shipping=function(b,e,d,u){function t(){(new nettools.jscore.validator.FormValidator({required:"surname firstname address1 zipcode city country email phone".split(" "),regexps:{email:nettools.jscore.validator.Patterns.MAIL,zipcode:new RegExp(NTPaypal.i18n.ui.SECTION2_SHIPPING.regexp_zipcode),phone:new RegExp(NTPaypal.i18n.ui.SECTION2_SHIPPING.regexp_phone)},root:"NTPP_f_"})).isValid(this.elements).status&&d();return!1}this.render=function(){var c=NTPaypal.i18n.ui.SECTION2_SHIPPING;
b.innerHTML=`<form name="NTPP_f_shipping" id="NTPP_f_shipping">
	<p><label>${c.surname} : </label><input type="text" id="NTPP_f_surname" name="NTPP_f_surname" required title="${c.surname}"></p>
	<p><label>${c.firstname} : </label><input type="text" id="NTPP_f_firstname" name="NTPP_f_firstname" required title="${c.firstname}"></p>
	<p><label>${c.address1} : </label><input type="text" id="NTPP_f_address1" name="NTPP_f_address1" required title="${c.address1}"></p>
	<p><label>${c.address2} : </label><input type="text" id="NTPP_f_address2" name="NTPP_f_address2" title="${c.address2}"></p>
	<p><label>${c.zipcode} : </label><input type="text" id="NTPP_f_zipcode" name="NTPP_f_zipcode" required title="${c.zipcode}" pattern="${c.regexp_zipcode}"></p>
	<p><label>${c.city} : </label><input type="text" id="NTPP_f_city" name="NTPP_f_city" required title="${c.city}"></p>
	<p><label>${c.country} : </label><select id="NTPP_f_country" name="NTPP_f_country" required title="${c.country}"></select></p>
	<p><label>${c.email} : </label><input type="email" id="NTPP_f_email" name="NTPP_f_email" required pattern="[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}" title="${c.email}"></p>
	<p><label>${c.phone} : </label><input type="tel" id="NTPP_f_phone" name="NTPP_f_phone" required title="${c.phone}" pattern="${c.regexp_phone}"></p>

	<div class="NTTP_buttons" style="margin-top: 3em;">
		<input type="button" value="${c.btn_backToCart}">
		<input type="submit" value="${c.btn_toConfirm}">
	</div>
</form>`;var k=b.firstChild.querySelector("select"),m=null;c="function"==typeof u?u()||[{country:"United States",code:"US"}]:[{country:"United States",code:"US"}];c.forEach(function(n){n.isDefault&&(m=k.options.length);k.add(new Option(n.country,n.code))});null===m&&(m=k.options.length,k.add(new Option("","")));k.selectedIndex=m;b.firstChild.onsubmit=t;b.firstChild.querySelector("input[type='button']").onclick=e};this.getRecipient=function(){return new NTPaypal.Customer(b.querySelector("#NTPP_f_firstname").value,
{surname:b.querySelector("#NTPP_f_surname").value.toUpperCase(),address1:b.querySelector("#NTPP_f_address1").value,address2:b.querySelector("#NTPP_f_address2").value,zipcode:b.querySelector("#NTPP_f_zipcode").value,city:b.querySelector("#NTPP_f_city").value.toUpperCase(),countrycode:b.querySelector("#NTPP_f_country").value,email:b.querySelector("#NTPP_f_email").value,phone:b.querySelector("#NTPP_f_phone").value})}};
NTPaypal.UI.Section3_Confirm=function(b,e,d,u,t,c,k,m,n,y){function w(a,f){if("function"!=typeof n)return alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.payment_received),Promise.resolve();a=n(e.cart,a,f);return a instanceof Promise?a:Promise.resolve()}function l(){function a(g,h){w(g,h).then(function(){e.cart.empty();e.delete()}).then(function(){b.parentNode.innerHTML="";"function"==typeof y&&y()}).catch(f)}function f(g){console.log(g);g instanceof Error?alert(g.message):"object"==typeof g&&g.orderID?alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.payment_error):
alert(g);b.querySelectorAll(".NTTP_buttons input").forEach(function(h){h.disabled=!1});b.querySelector("#NTPP_s3_paypal").innerHTML=""}var v=b.querySelector("#NTPP_s3_carrier_select");if(1<v.options.length&&1>v.selectedIndex)alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.carrier_select);else if(b.querySelector("#cb_agreement").checked)try{var x=b.querySelector("#NTPP_s3_paypal");x.innerHTML="";b.querySelectorAll(".NTTP_buttons input").forEach(function(g){g.disabled=!0});var q=d.getRecipient();e.shop.sell(e.cart).to(q).withShipping(b.querySelector("#NTPP_s3_shipping_cost").getAttribute("data-cost")).withDescription(e.shop.shopname).payButtonsInside("#NTPP_s3_paypal").execute().then(function(g){x.innerHTML=
"";a(q,g)}).catch(f);x.scrollIntoView?x.scrollIntoView():window.scrollTo(0,document.body.scrollHeight)}catch(g){f(g)}else alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.tos_accept)}function z(a){if(1>this.selectedIndex)b.querySelector("#NTPP_s3_shipping_cost").innerHTML=b.querySelector("#NTPP_s3_total").innerHTML=NTPaypal.i18n.ui.SECTION3_CONFIRM.shipping_nocarrier,b.querySelector("#NTPP_s3_shipping_cost").removeAttribute("data-cost");else{var f=0;e.cart.getContent().forEach(function(v){f+=v.quantity*(v.product.price+
v.product.tax)});a=Number.parseFloat(this.options[this.selectedIndex].value);b.querySelector("#NTPP_s3_shipping_cost").innerHTML=a.toFixed(2)+" "+e.shop.currency_code;b.querySelector("#NTPP_s3_total").innerHTML=Number.parseFloat(f+a).toFixed(2)+" "+e.shop.currency_code;b.querySelector("#NTPP_s3_shipping_cost").setAttribute("data-cost",a.toFixed(2))}}function p(a,f){function v(h){a.selectedIndex=Number.parseInt(this.value);a.onchange()}for(;a.options.length;)a.remove(0);a.add(new Option("",""));a.selectedIndex=
0;var x=!1;f.forEach(function(h){a.add(new Option(h.carrier+(h.shipping_time?" - "+h.shipping_time:"")+` (+ ${Number.parseFloat(h.cost).toFixed(2)} ${e.shop.currency_code})`,h.cost));h.image&&(x=!0)});if(x){a.style.display="none";var q=document.getElementById("NTPP_s3_carrier_imageselect")||document.createElement("DIV");q.id="NTPP_s3_carrier_imageselect";q.innerHTML="";var g=1;f.forEach(function(h){var B=document.createElement("LABEL"),r=document.createElement("INPUT");r.type="radio";r.value=g++;
r.title=h.carrier;r.name="carrier";r.onclick=v;B.appendChild(r);h.image&&(r=document.createElement("IMG"),r.src=h.image,B.appendChild(r));r=document.createElement("SPAN");r.title=h.carrier;var A=[];h.image||A.push(h.carrier);h.shipping_time&&A.push(h.shipping_time);A=(A=A.join("&nbsp;-&nbsp;"))?[A]:[];A.push(`(+&nbsp;${Number.parseFloat(h.cost).toFixed(2)}&nbsp;${e.shop.currency_code})`);r.innerHTML=A.join("&nbsp;");B.appendChild(r);q.appendChild(B)});q.parentNode||a.parentNode.appendChild(q)}else a.style.display=
"inline-block",(q=document.getElementById("NTPP_s3_carrier_imageselect"))&&q.parentNode.removeChild(q)}this.render=function(){var a=NTPaypal.i18n.ui.SECTION3_CONFIRM;b.innerHTML=`<p id="NTPP_s3_carrier">${a.carrier} : <select id="NTPP_s3_carrier_select"></select></p>
<p id="NTPP_s3_line1">${a.shipping} <span id="NTPP_s3_shipping_cost" data-cost="0"></span>.</p>
<p id="NTPP_s3_line2">${a.intro}, ${a.total} <span id="NTPP_s3_total"></span>.</p>
<p id="NTPP_s3_shipping_details">${a.recipient} :
	<pre id="NTPP_s3_shipping"></pre>
</p>

<p id="NTPP_s3_tos"><strong><label><input type="checkbox" value="1" id="cb_agreement">${a.agreement}</label></strong></p>
<p id="NTPP_s3_tos_link"></p>

<p id="NTPP_s3_custom_message"></p>

<div class="NTTP_buttons" style="margin-top: 2em;">
	<input type="button" value="${a.btn_backToCart}">
	<input type="button" value="${a.btn_backToShipping}">
	<input type="button" value="${a.btn_pay}">
</div>

<div id="NTPP_s3_paypal" style="margin-top: 2em;"></div>`;b.querySelector(".NTTP_buttons").getElementsByTagName("input")[0].onclick=u;b.querySelector(".NTTP_buttons").getElementsByTagName("input")[1].onclick=t;b.querySelector(".NTTP_buttons").getElementsByTagName("input")[2].onclick=l;b.querySelector("#NTPP_s3_carrier_select").onchange=z;a=b.querySelector("#NTPP_s3_tos_link");a.style.display=c&&c.url?"block":"none";c&&c.url&&(a.innerHTML=`<a href="${c.url}" target="_blank">${c.title?c.title:c.url}</a>`)};
this.update=function(){var a=b.querySelector("#NTPP_s3_carrier_select");var f="function"==typeof k?k(e.cart,d.getRecipient())||0:0;if("number"!=typeof f&&("object"!=typeof f||"Array"!=f.constructor.name))throw Error("getShippingCost callback returned value is not a float or an array");if("number"!=typeof f){var v="";f.forEach(function(g){v+=g.carrier+g.cost});var x=CryptoJS.MD5(v).toString()}else{for(;a.options.length;)a.remove(0);a.add(new Option("",""));a.selectedIndex=0}b.querySelector("#NTPP_s3_carrier").style.display=
"number"!=typeof f?"block":"none";if("number"==typeof f){var q=0;e.cart.getContent().forEach(function(g){q+=g.quantity*(g.product.price+g.product.tax)});b.querySelector("#NTPP_s3_shipping_cost").innerHTML=Number.parseFloat(f).toFixed(2)+" "+e.shop.currency_code;b.querySelector("#NTPP_s3_total").innerHTML=Number.parseFloat(f+q).toFixed(2)+" "+e.shop.currency_code;b.querySelector("#NTPP_s3_shipping_cost").setAttribute("data-cost",Number.parseFloat(f).toFixed(2))}else a.getAttribute("data-carriers_hash")!=
x?(p(a,f),a.setAttribute("data-carriers_hash",x),b.querySelector("#NTPP_s3_shipping_cost").innerHTML=NTPaypal.i18n.ui.SECTION3_CONFIRM.shipping_nocarrier,b.querySelector("#NTPP_s3_total").innerHTML=NTPaypal.i18n.ui.SECTION3_CONFIRM.shipping_nocarrier):z.call(a);a=d.getRecipient();b.querySelector("#NTPP_s3_shipping").innerHTML=`${a.firstname}  ${a.surname}
${a.address1}
${a.address2}
${a.zipcode} ${a.city}
${a.countrycode}
${a.email}
${a.phone}`;a="function"==typeof m?m(e.cart,d.getRecipient())||"":"";f=b.querySelector("#NTPP_s3_custom_message");f.style.display=a?"block":"none";f.innerHTML=a}};