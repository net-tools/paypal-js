'use strict';



// checking client.js is known
if ( typeof NTPaypal != 'object' )
	throw new Error('client.js script is mandatory and a dependency of ui.js');

if ( typeof NTPaypal.Store != 'function' )
	throw new Error('store.js script is mandatory and a dependency of ui.js');

if ( typeof CryptoJS != 'object' )
	throw new Error('js-core.js from net-tools/js-core package is mandatory and a dependency of ui.js');





/**
 * Class for default translations
 */
NTPaypal.i18n = {
	
	// for ui.js
	ui : {
		SECTION1_CART : {
			product		: 'Product',
			quantity	: 'Quantity',
			price 		: 'Price per unit', 
			total 		: 'Total',
			with_vat	: 'VAT incl.',
			vat_amount	: 'VAT amount',
			btn_toShipping : 'Validate cart and go to shipping details',
			stock_issue : "Can't add another item of that product because the shop stock is not enough"
		},
		
		
		SECTION2_SHIPPING : {
			firstname : 'Firstname',
			surname   : 'Surname',
			address1  : 'Address',
			address2  : 'Building, Appt n°...',
			zipcode	  : 'Zipcode',
			city	  : 'City',
			country	  : 'Country',
			email	  : 'Email',
			phone	  : 'Phone number',
			btn_backToCart : 'Back to cart',
			btn_toConfirm  : 'Review order and pay',
			regexp_zipcode : '^[0-9]{5}(?:-[0-9]{4})?$',
			regexp_phone : '^\\d{10}$'
		},
		
		
		SECTION3_CONFIRM : {
			carrier		: "Please choose a carrier from the following list box",
			shipping 	: "For a delivery at the address below, the shipping cost is",
			shipping_nocarrier : "[--Please choose carrier first--]",
			carrier_select : "Please choose a carrier before clicking on 'Pay now' button",
			intro 		: "You are about to place an order for your shopping cart",
			total		: "total (shipping incl.)",
			recipient	: "Your order will be sent to this address",
			agreement 	: "By ticking the checkbox, you agree to the Terms of Sales and accept to pay for the items purchased",
			btn_backToCart : 'Back to cart',
			btn_backToShipping : 'Update shipping details',
			btn_pay		: 'Pay now',
			tos_accept  : 'You have to accept Terms of Sales before clicking on \'Pay now\' button',
			payment_error	: "No payment received, you may try again",
			payment_received : "Your payment has been confirmed. Thanks."
		}
	}
}



// ----------------------------------------------------------------------



/**
 * Constructor of a UI top object
 *
 * @param string selector CSS-like selector to identify the tag where the cart/delivery options/confirm screen should be rendered
 * @param Session session Session object with its properties cart, shop, store set with appropriate objects
 * @param object events Object litteral with callback properties onCountries():[(country, code, isDefault)], onPaymentReceived(cart, customer, paypalData), onShippingCost(cart, customer):float|[(carrier, cost, shipping_time, image)], onCustomMessage(cart, customer):string
 */
NTPaypal.UI = function(selector, session, events){
	
	events = events || {};
	
	
	this.container = document.querySelector(selector);
	this.section1_cart = null;
	this.section2_shipping = null;
	this.section3_confirm = null;
	this.sections = [];
	
	
	if ( !this.container )
		throw new Error("Selector '" + selector + "' doesn't match any tag in document");

	if ( !(session instanceof NTPaypal.Session) )
		throw new TypeError("'session' parameter of 'UI' constructor method is not an instance of 'Session'");
	
	if ( events.onCountries && !(typeof(events.onCountries) == 'function') )
		throw new TypeError("'events.onCountries' parameter of 'UI' constructor method is not function");

	if ( events.onShippingCost && !(typeof(events.onShippingCost) == 'function') )
		throw new TypeError("'events.onShippingCost' parameter of 'UI' constructor method is not function");

	if ( events.onPaymentReceived && !(typeof(events.onPaymentReceived) == 'function') )
		throw new TypeError("'events.onPaymentReceived' parameter of 'UI' constructor method is not function");
	
	if ( events.onCustomMessage && !(typeof(events.onCustomMessage) == 'function') )
		throw new TypeError("'events.onCustomMessage' parameter of 'UI' constructor method is not function");
	
	
	this.session = session;
	this.onCountries = events.onCountries;
	this.onPaymentReceived = events.onPaymentReceived;
	this.onShippingCost = events.onShippingCost;
	this.onCustomMessage = events.onCustomMessage;
}



/**
 * Display dialog
 */
NTPaypal.UI.prototype.show = function()
{
	// create sections with IDs and make a list of sections
	var _sect1_cart = this.section1_cart = document.createElement('SECTION');
	var _sect2_shipping = this.section2_shipping = document.createElement('SECTION');
	var _sect3_confirm = this.section3_confirm = document.createElement('SECTION');
	var _sections = this.sections = [_sect1_cart, _sect2_shipping, _sect3_confirm];
	_sect1_cart.id = "NTPP_S_Cart";
	_sect2_shipping.id = "NTPP_S_Shipping";
	_sect3_confirm.id = "NTPP_S_Confirm";
	var _ui_s1 = null;
	var _ui_s2 = null;
	var _ui_s3 = null;
	
	
	
	/** 
	 * Private function to go to a section, hiding the other ones
	 */
	function __moveTo(sect)
	{
		// hide all sections
		_sections.forEach(function(s){ s.style.display = 'none'; })
		sect.style.display = 'block';
	}
	
	
	
	/** 
	 * Private function to go to shipping page
	 */
	function __toShipping()
	{
		__moveTo(_sect2_shipping);
	}
	
	
	
	/** 
	 * Private function to go to cart content
	 */
	function __toCart()
	{
		__moveTo(_sect1_cart);
	}

	
	
	/** 
	 * Private function to go to confirm page
	 */
	function __toConfirm()
	{
		// update screen, as cart content and recipient were not known during initial rendering and may have changed since
		_ui_s3.update();
		
		__moveTo(_sect3_confirm);
	}
	

		
	
	
	
	// reset ui
	this.container.innerHTML = '';
	
	
	// render sections
	_ui_s1 = new NTPaypal.UI.Section1_Cart(_sect1_cart, this.session, __toShipping);
	_ui_s2 = new NTPaypal.UI.Section2_Shipping(_sect2_shipping, __toCart, __toConfirm, this.onCountries);
	_ui_s3 = new NTPaypal.UI.Section3_Confirm(_sect3_confirm, this.session, _ui_s2, __toCart, __toShipping, this.onShippingCost, this.onCustomMessage, this.onPaymentReceived);
	_ui_s1.render();
	_ui_s2.render();
	_ui_s3.render();
	
	
	// add sections to container
	this.sections.forEach(
		function(s)
		{
			s.style.display = 'none';
			this.container.appendChild(s);
		}, this);
	
	
	// show first one
	__toCart();
}



// ----------------------------------------------------------------------



/**
 * UI class to render Cart section
 *
 * @param HTMLElement section HTML tag to render the cart into
 * @param Session session
 * @param function next Function to call to pass control to "section 2 / shipping details"
 */
NTPaypal.UI.Section1_Cart = function(section, session, next)
{
	/** 
	 * Private function to handle click event on "-" button
	 */
	function __cartMinus(e)
	{
		__cartPlus.call(this, e, -1);
	}
	
	
		
	/** 
	 * Private function to handle click event on "+" button
	 *
	 * @param int q Amount to add (may be negative)
	 */
	function __cartPlus(e, q)
	{
		var q = q || 1;
		var sku = this.getAttribute('data-sku');
		

		try
		{
			// update quantity
			if ( !session.store.updateCartQuantity(sku, q, session.cart) )
				alert(NTPaypal.i18n.ui.SECTION1_CART.stock_issue);
			else
				session.save();	

			
			// draw again cart content after update
			__cartContent();
		}
		catch (err)
		{
			_error(err);
		}
	}
	
	
	

	/**
	 * Private function to render cart content inside a section
	 */
	function __cartContent()
	{
		// template for cart content
		section.innerHTML = 
`<table id="NTPP_S_Cart_Content">
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
</div>`;


		var table = section.firstChild;
		var tbody = table.querySelector('tbody');
		tbody.innerHTML = '';

		var items = session.cart.getContent();
		var total = 0;
		var tax = 0;

		
		// for each product in cart
		items.forEach(function(item){
			var tr = document.createElement('TR');
			var td = document.createElement('TD');
			td.innerHTML = item.product.title;
			tr.appendChild(td);
			var td = document.createElement('TD');
			td.innerHTML = "<a href=\"javascript:void(0)\" data-sku=\"" + item.product.sku + "\">-</a><span>" + item.quantity + "</span><a href=\"javascript:void(0)\" data-sku=\"" + item.product.sku + "\">+</a>";
			td.getElementsByTagName('a')[0].onclick = __cartMinus;
			td.getElementsByTagName('a')[1].onclick = __cartPlus;
			tr.appendChild(td);
			var td = document.createElement('TD');
			td.innerHTML = Number.parseFloat(item.product.price + item.product.tax).toFixed(2) + " " + session.shop.currency_code;
			tr.appendChild(td);
			var td = document.createElement('TD');
			td.innerHTML = Number.parseFloat((item.product.price + item.product.tax) * item.quantity).toFixed(2) + " " + session.shop.currency_code;
			tr.appendChild(td);

			total += (item.product.price + item.product.tax) * item.quantity;
			tax += item.product.tax * item.quantity;

			tbody.appendChild(tr);
		});



		// total amount
		table.querySelector('#NTPP_S_Cart_Content_Total').innerHTML = Number.parseFloat(total).toFixed(2) + " " + session.shop.currency_code;
		
		// removing TAX line if tax = 0
		if ( tax == 0 )
			table.querySelector('#NTPP_S_Cart_Content_TaxLine').style.display = 'none';
		else
			table.querySelector('#NTPP_S_Cart_Content_Tax').innerHTML = '(' + Number.parseFloat(tax).toFixed(2) + " " + session.shop.currency_code + ')'; 

		
		// if cart is empty, forbidding to go to shipping page
		if ( items.length == 0 )
			section.lastChild.querySelector('input').disabled = true;
		else
			section.lastChild.querySelector('input').onclick = next;
	}	
	
	
	
	// public method here
	this.render = __cartContent;
}



// ----------------------------------------------------------------------



/**
 * UI class to render Shipping section
 *
 * @param HTMLElement section HTML tag to render the shipping details into
 * @param function back Function to call to pass control back to "section 1 / cart"
 * @param function next Function to call to pass control to "section 3 / confirm"
 * @param function onCountries Callback function() returning an array of object litterals (country, code, isDefault)
 */
NTPaypal.UI.Section2_Shipping = function(section, back, next, onCountries)
{
	function __getCountries()
	{
		// compute shipping cost for this delivery location
		if ( typeof(onCountries) == 'function' )
			return onCountries() || [{country:'United States', code:'US'}];
		else
			return [{country:'United States', code:'US'}];
	}
	
	
	
	function __onSubmit()
	{
		// validating
		var fval = new nettools.jscore.validator.FormValidator({
			required : ['surname', 'firstname', 'address1', 'zipcode', 'city', 'country', 'email', 'phone'],
			regexps : {
				email : nettools.jscore.validator.Patterns.MAIL,
				zipcode : new RegExp(NTPaypal.i18n.ui.SECTION2_SHIPPING.regexp_zipcode),
				phone : new RegExp(NTPaypal.i18n.ui.SECTION2_SHIPPING.regexp_phone)
			},
			root : 'NTPP_f_'
		});



		// if all required fields set, go to confirm page
		var val = fval.isValid(this.elements);
		if ( val.statut )
			next();
		else
		{
			alert(val.message);
			if ( val.field && val.field.focus )
				val.field.focus();
		}


		// returning false, as the form is never submitted
		return false;
	}
	
	
	
	function __content()
	{
		// template for shipping details content
		var i18n = NTPaypal.i18n.ui.SECTION2_SHIPPING;
		section.innerHTML = 
`<form name="NTPP_f_shipping" id="NTPP_f_shipping">
	<p><label>${i18n.surname} : </label><input type="text" id="NTPP_f_surname" name="NTPP_f_surname" required title="${i18n.surname}"></p>
	<p><label>${i18n.firstname} : </label><input type="text" id="NTPP_f_firstname" name="NTPP_f_firstname" required title="${i18n.firstname}"></p>
	<p><label>${i18n.address1} : </label><input type="text" id="NTPP_f_address1" name="NTPP_f_address1" required title="${i18n.address1}"></p>
	<p><label>${i18n.address2} : </label><input type="text" id="NTPP_f_address2" name="NTPP_f_address2" title="${i18n.address2}"></p>
	<p><label>${i18n.zipcode} : </label><input type="text" id="NTPP_f_zipcode" name="NTPP_f_zipcode" required title="${i18n.zipcode}" pattern="${i18n.regexp_zipcode}"></p>
	<p><label>${i18n.city} : </label><input type="text" id="NTPP_f_city" name="NTPP_f_city" required title="${i18n.city}"></p>
	<p><label>${i18n.country} : </label><select id="NTPP_f_country" name="NTPP_f_country" required title="${i18n.country}"></select></p>
	<p><label>${i18n.email} : </label><input type="email" id="NTPP_f_email" name="NTPP_f_email" required pattern="[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}" title="${i18n.email}"></p>
	<p><label>${i18n.phone} : </label><input type="tel" id="NTPP_f_phone" name="NTPP_f_phone" required title="${i18n.phone}" pattern="${i18n.regexp_phone}"></p>	

	<div class="NTTP_buttons" style="margin-top: 3em;">
		<input type="button" value="${i18n.btn_backToCart}">
		<input type="submit" value="${i18n.btn_toConfirm}">
	</div>
</form>`;
		
		
		// build country list
		var select = section.firstChild.querySelector('select');
		var selected = null;
		__getCountries().forEach(function (c)
			{
				// remember default country
				if ( c.isDefault )
					selected = select.options.length;
			
				select.add(new Option(c.country, c.code));
			});
		
		// if no default country, create an empty line to force selection, as the field is required
		if ( selected === null)
		{
			selected = select.options.length;
			select.add(new Option('',''));
		}
		
		// set default country
		select.selectedIndex = selected;
	
	
		// event handlers : form and buttons to go back to cart and to confirm
		section.firstChild.onsubmit = __onSubmit;
		section.firstChild.querySelector('input[type=\'button\']').onclick = back;
	}
	
	
	this.render = __content;
	
	
	
	/**
	 * Get shipping details as a Customer object
	 *
	 * @return Customer
	 */
	this.getRecipient = function()
		{
			return new NTPaypal.Customer(section.querySelector('#NTPP_f_firstname').value,
				{
					surname		: section.querySelector('#NTPP_f_surname').value.toUpperCase(),
					address1	: section.querySelector('#NTPP_f_address1').value,
					address2	: section.querySelector('#NTPP_f_address2').value,
					zipcode		: section.querySelector('#NTPP_f_zipcode').value,
					city		: section.querySelector('#NTPP_f_city').value.toUpperCase(),
					countrycode : section.querySelector('#NTPP_f_country').value,
					email		: section.querySelector('#NTPP_f_email').value,
					phone		: section.querySelector('#NTPP_f_phone').value
				});
		}
}



// ----------------------------------------------------------------------



/**
 * UI class to render Confirm section
 *
 * @param HTMLElement section HTML tag to render the shipping details into
 * @param Session session
 * @param NTPaypal.UI.Section2_Shipping s2_ui_renderer Reference to renderer of "section 2 shipping" (used to retrieve customer details)
 * @param function backToCart Function to call to pass control back to "section 1 / cart"
 * @param function backToShipping Function to call to pass control back to "section 2 / shipping"
 * @param function onShippingCost Callback function(cart, customer):float|array returning shipping cost (float or array of object litteral (carrier, cost, shipping_time, image))
 * @param function onCustomMessage Callback function(cart, customer):string returning custom message 
 * @param function onPaymentReceived Callback function(cart, customer, paypalData)
 */
NTPaypal.UI.Section3_Confirm = function(section, session, s2_ui_renderer, backToCart, backToShipping, onShippingCost, onCustomMessage, onPaymentReceived)
{
	// call a user callback function to get either a float with shipping cost, or an array of (string carrier, float cost, string shipping_time, string image) object litterals 
	// so that the user can choose its carrier
	function __getShippingCost()
	{
		// compute shipping cost for this delivery location
		if ( typeof(onShippingCost) == 'function' )
			return onShippingCost(session.cart, s2_ui_renderer.getRecipient()) || 0;
		else
			return 0;
	}
	
	
	
	// call a user callback function to get custom message 
	function __getCustomMessage()
	{
		// compute shipping cost for this delivery location
		if ( typeof(onCustomMessage) == 'function' )
			return onCustomMessage(session.cart, s2_ui_renderer.getRecipient()) || '';
		else
			return '';
	}
	
	
	
	// draw paypal buttons
	function __paypal()
	{
		function ___error(err)
		{
			console.log(err);
			
			
			// if exception
			if ( err instanceof Error )
				alert(err.message);
			
			// if canceled from paypal screen
			else if ( (typeof(err) == 'object') && err.orderID )
				alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.payment_error);
			
			// other error condition
			else
				alert(err);


			// enable buttons again and empty paypal container
			section.querySelectorAll('.NTTP_buttons input').forEach(function(btn){ btn.disabled = false; });
			section.querySelector('#NTPP_s3_paypal').innerHTML = '';		
		}
		
		
		
		
		// check carrier selected (only if carrier can be choosen)
		var carrier = section.querySelector('#NTPP_s3_carrier_select');
		if ( carrier.options.length > 1 )
			if ( carrier.selectedIndex < 1 )
			{
				alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.carrier_select);
				return;	
			}
		
		
		
		// check TOS
		if ( !section.querySelector('#cb_agreement').checked )
		{
			alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.tos_accept);
			return;
		}



		try
		{
			// raz paypal container
			var paypal_div = section.querySelector('#NTPP_s3_paypal');
			paypal_div.innerHTML = '';

			// deactivate buttons until payment done or canceled
			section.querySelectorAll('.NTTP_buttons input').forEach(function(btn){ btn.disabled = true; });


			// get customer details
			var cust = s2_ui_renderer.getRecipient();
			
			
			// sell cart through our api
			session.shop.sell(session.cart)
					.to(cust)
					.withShipping(section.querySelector('#NTPP_s3_shipping_cost').getAttribute('data-cost'))
					.withDescription(session.shop.shopname)
				.payButtonsInside('#NTPP_s3_paypal')
				.execute()

				.then(function(data){
						// on payment success, removing paypal buttons
						paypal_div.innerHTML = '';

						// callback to process payement or default "payment received thank you" message
						if ( typeof (onPaymentReceived) == 'function' )
							onPaymentReceived(session.cart, cust, data);
						else
							alert(NTPaypal.i18n.ui.SECTION3_CONFIRM.payment_received);
					})
				.catch(___error);		



			// scroll paypal buttons into view top
			if ( paypal_div.scrollIntoView )
				paypal_div.scrollIntoView();
			else
				window.scrollTo(0,document.body.scrollHeight);
		}
		catch(err)
		{
			___error(err);
		}	
	}
	
	
	
	function __carrierChange(e)
	{
		// onchange event of carrier select box : compute total with selected carrier cost and update screen
		if ( this.selectedIndex < 1 )
		{
			section.querySelector('#NTPP_s3_shipping_cost').innerHTML = section.querySelector('#NTPP_s3_total').innerHTML = NTPaypal.i18n.ui.SECTION3_CONFIRM.shipping_nocarrier;
			section.querySelector('#NTPP_s3_shipping_cost').removeAttribute('data-cost');
		}
		else
		{
			// compute products total
			var total = 0;
			session.cart.getContent().forEach(function(item) { total += item.quantity * (item.product.price+item.product.tax); });

			// cost of currently selected carrier
			var cost_sel = Number.parseFloat(this.options[this.selectedIndex].value);
			
			section.querySelector('#NTPP_s3_shipping_cost').innerHTML = cost_sel.toFixed(2) + " " + session.shop.currency_code;
			section.querySelector('#NTPP_s3_total').innerHTML = Number.parseFloat(total + cost_sel).toFixed(2) + " " + session.shop.currency_code;

			// store shipping cost in attribute to get it easily when creating paypal payload
			section.querySelector('#NTPP_s3_shipping_cost').setAttribute('data-cost', cost_sel.toFixed(2));
		}
	}
	
	
	
	function __content()
	{
		// template for confirm content
		var i18n = NTPaypal.i18n.ui.SECTION3_CONFIRM;
		section.innerHTML = 
`<p id="NTPP_s3_carrier">${i18n.carrier} : <select id="NTPP_s3_carrier_select"></select></p>
<p id="NTPP_s3_line1">${i18n.shipping} <span id="NTPP_s3_shipping_cost" data-cost="0"></span>.</p>
<p id="NTPP_s3_line2">${i18n.intro}, ${i18n.total} <span id="NTPP_s3_total"></span>.</p>
<p id="NTPP_s3_shipping_details">${i18n.recipient} :
	<pre id="NTPP_s3_shipping"></pre>
</p>

<p id="NTPP_s3_tos"><strong><label><input type="checkbox" value="1" id="cb_agreement">${i18n.agreement}</label></strong></p>

<p id="NTPP_s3_custom_message"></p>

<div class="NTTP_buttons" style="margin-top: 2em;">
	<input type="button" value="${i18n.btn_backToCart}">
	<input type="button" value="${i18n.btn_backToShipping}">
	<input type="button" value="${i18n.btn_pay}">
</div>

<div id="NTPP_s3_paypal" style="margin-top: 2em;"></div>`;
	
	
		// event handlers : form and buttons to go back to cart and to confirm
		section.querySelector('.NTTP_buttons').getElementsByTagName('input')[0].onclick = backToCart;
		section.querySelector('.NTTP_buttons').getElementsByTagName('input')[1].onclick = backToShipping;
		section.querySelector('.NTTP_buttons').getElementsByTagName('input')[2].onclick = __paypal;
		section.querySelector('#NTPP_s3_carrier_select').onchange = __carrierChange;
	}
	
	
	
	// create listbox of carriers
	function __buildCarrierList(sel, carriers)
	{
		function ___radioClick(e)
		{
			sel.selectedIndex = Number.parseInt(this.value);
			sel.onchange();
		}
		
		
		
		// delete all carriers in the list and add an empty one to force selection
		while ( sel.options.length )
			sel.remove(0);
		sel.add(new Option('', ''));
		sel.selectedIndex = 0;

		
		// adding carriers in listbox
		var isImageList = false;
		carriers.forEach(function(carrier){
			sel.add(new Option(carrier.carrier + (carrier.shipping_time ? (' - ' + carrier.shipping_time) : '') + ` (+ ${Number.parseFloat(carrier.cost).toFixed(2)} ${session.shop.currency_code})`, carrier.cost)); 
			if ( carrier.image )
				isImageList = true;
		});
		
		
		
		// if image list
		if ( isImageList )
		{
			// hiding select box, create or re-use div for radio buttons
			sel.style.display = 'none';
			var div = document.getElementById('NTPP_s3_carrier_imageselect') || document.createElement('DIV');
			div.id = "NTPP_s3_carrier_imageselect";
			div.innerHTML = '';
			
			
			// creating radio buttons
			var i = 1;
			carriers.forEach(function(carrier){

				var label = document.createElement('LABEL');
				var input = document.createElement('INPUT');
				input.type = 'radio';
				input.value = i++;	// storing select index for same carrier ; index 0 is 'no carrier selected'
				input.title = carrier.carrier;
				input.name = 'carrier';
				input.onclick = ___radioClick;
				label.appendChild(input);			
				
				if ( carrier.image )
				{
					var img = document.createElement('IMG');
					img.src = carrier.image;
					label.appendChild(img);
				}
				
				var span = document.createElement('SPAN');
				span.innerHTML = (carrier.image ? '' : (carrier.carrier + '&nbsp;-&nbsp;')) + (carrier.shipping_time ? (carrier.shipping_time + ' ') : '') + `(+&nbsp;${Number.parseFloat(carrier.cost).toFixed(2)}&nbsp;${session.shop.currency_code})`;
				span.title = carrier.carrier;
				label.appendChild(span);
				div.appendChild(label);
			});


			if ( !div.parentNode )
				sel.parentNode.appendChild(div);
		}
		
		
		// if listbox, display it and remove image list as radio buttons
		else
		{
			sel.style.display = 'inline-block';
			var div = document.getElementById('NTPP_s3_carrier_imageselect');
			if ( div )
				div.parentNode.removeChild(div);
		}
	}
	
	
	
	this.render = __content;
	
	
	
	/**
	 * Updating data on screen
	 */
	this.update = function()
	{
		// compute shipping cost for this delivery location ; we may receive either a float, or an array of object litterals {carrier, cost}
		var sel = section.querySelector('#NTPP_s3_carrier_select');
		var shipping = __getShippingCost();

		
		// checking returned value : must be float or array
		if ( (typeof(shipping) != 'number') && ((typeof(shipping) != 'object') || (shipping.constructor.name != 'Array')) )
			throw new Error('getShippingCost callback returned value is not a float or an array');

		
		
		// if asking for user choice for carrier
		if ( typeof(shipping) != 'number' )
		{				
			// compute hash for carriers costs just received from callback
			var data = '';
			shipping.forEach(function(carrier){ data += carrier.carrier + carrier.cost; });
			var carriers_hash = CryptoJS.MD5(data).toString();
		}
		
		// no choice for carrier, emptying list and selecting first empty option
		else
		{
			// delete all carriers in the list and add an empty one to force selection
			while ( sel.options.length )
				sel.remove(0);
			sel.add(new Option('', ''));
			sel.selectedIndex = 0;
		}

		

		// carrier line visibility 
		section.querySelector('#NTPP_s3_carrier').style.display = (typeof(shipping) != 'number')?'block':'none';
		
		
		
		// if we have a float, no carrier selection, compute costs now
		if ( typeof(shipping) == 'number' )
		{
			// compute products total
			var total = 0;
			session.cart.getContent().forEach(function(item) { total += item.quantity * (item.product.price+item.product.tax); });


			// set shipping and total in span tag
			section.querySelector('#NTPP_s3_shipping_cost').innerHTML = Number.parseFloat(shipping).toFixed(2) + " " + session.shop.currency_code;
			section.querySelector('#NTPP_s3_total').innerHTML = Number.parseFloat(shipping + total).toFixed(2) + " " + session.shop.currency_code;
			

			// store shipping cost in attribute to get it easily when creating paypal payload
			section.querySelector('#NTPP_s3_shipping_cost').setAttribute('data-cost', Number.parseFloat(shipping).toFixed(2));
		}
		

		// if asking for carrier selection, don't compute shipping cost and total until a carrier is selected
		else
		{
			// if current list hash does not match previously computed hash, the list must be created again
			if ( sel.getAttribute('data-carriers_hash') != carriers_hash )
			{
				// delete all carriers in the list and add an empty one to force selection, then add new carriers/costs ; store carriers hash
				__buildCarrierList(sel, shipping);
				sel.setAttribute('data-carriers_hash', carriers_hash);

				// prompt for carrier choice
				section.querySelector('#NTPP_s3_shipping_cost').innerHTML = NTPaypal.i18n.ui.SECTION3_CONFIRM.shipping_nocarrier;
				section.querySelector('#NTPP_s3_total').innerHTML = NTPaypal.i18n.ui.SECTION3_CONFIRM.shipping_nocarrier;
			}
			
			
			// if carrier list unchanged, call event handler to compute again total (cart may have changed, but shipping options are still the same)
			else
				__carrierChange.call(sel);
		}

		
		
		// update recipient
		var cust = s2_ui_renderer.getRecipient();
		section.querySelector('#NTPP_s3_shipping').innerHTML = 
`${cust.firstname}  ${cust.surname}
${cust.address1}
${cust.address2}
${cust.zipcode} ${cust.city}
${cust.countrycode}
${cust.email}
${cust.phone}`;
		
		
		
		// update custom message
		var msg = __getCustomMessage();
		var pmsg = section.querySelector('#NTPP_s3_custom_message');
		pmsg.style.display = msg ? 'block':'none';
		pmsg.innerHTML = msg;
	}
}