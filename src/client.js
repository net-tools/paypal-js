'use strict';

// library namespace
var NTPaypal = NTPaypal || {};





/**
 * Constructor for a cart item
 *
 * @param string title Short description of product
 * @param string id Any relevant business ID (EAN, SKU, etc.)
 * @param int quantity Quantity purchased
 * @param float price Price for one product (excluding tax)
 * @param string category Category of goods (DIGITAL_GOODS, PHYSICAL_GOODS, DONATION)
 * @param string currency_code Such as EUR, GBP, USD, etc.
 * @param object other Object litteral of non-mandatory parameters : {float tax, string description}
 */
NTPaypal.CartItem = function(title, id, quantity, price, category, currency_code, other){
	
	// normalize other parameter
	other = other || {};
	
	this.title = title;
	this.id = id;
	this.quantity = quantity;
	this.price = price;
	this.currency_code = currency_code;
	this.category = category;
	this.tax = other['tax'] || 0;
	this.description = other['description'] || '';
	
	
	if ( !this.title )
		throw new Error("'title' parameter of 'CartItem' constructor not set");
	if ( !this.id )
		throw new Error("'id' parameter of 'CartItem' constructor not set");
	if ( !this.quantity )
		throw new Error("'quantity' parameter of 'CartItem' constructor not set");
	if ( typeof price == 'undefined' )
		throw new Error("'price' parameter of 'CartItem' constructor not set");
	if ( typeof category == 'undefined' )
		throw new Error("'category' parameter of 'CartItem' constructor not set");
	if ( !this.currency_code )
		throw new Error("'currency_code' parameter of 'CartItem' constructor not set");
	if ( this.quantity <= 0 )
		throw new Error("'quantity' parameter of 'CartItem' constructor is not in the allowed range");
}



/**
 * Convert a CartItem object to a Paypal item
 *
 * @return object
 */
NTPaypal.CartItem.prototype.toPaypalItem = function()
{
	return {
		name : this.title,
		unit_amount : {currency_code: this.currency_code, value:this.price},
		tax : {currency_code : this.currency_code, value:this.tax},
		quantity : this.quantity,
		description: this.description,
		sku : this.id,
		category : this.category
	}
}




// ----------------------------------------------------------------------



/**
 * Constructor for a customer object, providing details about shipping
 *
 * - Countrycode is a 2-characters string identify country
 * - Phone_type may be set to 'HOME' or 'MOBILE'
 *
 * @param string firstname
 * @param object other Object litteral with non-mandatory parameters {string surname, string address1, string address2, string zipcode, string city, string countrycode, string email, string phone, string phone_type}
 */
NTPaypal.Customer = function(firstname, other)
{
	if ( !firstname )
		throw new Error("'firstname' parameter of 'Customer' constructor not set");
	if ( (other['phone'] && !other['phone_type']) || (!other['phone'] && other['phone_type']) )
		throw new Error("'other.phone' and 'other.phone_type' parameters of 'Customer' constructor not set");
	if ( other['city'] || other['zipcode'] || other['countrycode'] )
	{
		if ( !other['city'] || !other['zipcode'] || !other['countrycode'] )
			throw new Error("'other.city', 'other.zipcode' and 'other.countrycode' parameters of 'Customer' constructor not set");
	}
	
	var other = other || {};
	
	this.firstname = firstname;
	this.surname = other['surname'] || '';
	this.address1 = other['address1'] || '';
	this.address2 = other['address2'] || '';
	this.zipcode = other['zipcode'] || '';
	this.city = other['city'] || '';
	this.countrycode = other['countrycode'] || '';
	this.email = other['email'] || '';
	this.phone = other['phone'] || '';
	this.phone_type = other['phone_type'] || '';
}



/**
 * Convert Customer object to paypal shipping_detail object
 *
 * @return object Returns a litteral object to be used as shipping_detail value in Paypal requests
 */
NTPaypal.Customer.prototype.toPaypalShipping = function() {
	
	var ret = {
		name : { full_name : (this.firstname + ' ' + this.surname).trim() },
		type : 'SHIPPING'
	};
	

	// append address if city/zipcode/country are set
	if ( this.city && this.zipcode && this.countrycode )
		ret.address = {
			address_line_1 : this.address1,
			address_line_2 : this.address2,
			admin_area_2 : this.city.toUpperCase(),
			postal_code : this.zipcode,
			country_code : this.countrycode
		};
	
	
	return ret;
}




// ----------------------------------------------------------------------




/**
 * Constructor of a shopping cart 
 *
 * @param null|CartItem[] items Array of CartItem objects ; content of shopping cart can be set later with add method instead of this items paremeters
 */
NTPaypal.Cart = function(items){
	
	if ( (typeof(items) == 'object') && (items.constructor.name != 'Array') )
		throw new TypeError("'items' parameter of 'Cart' constructor is not an array");
	
	/**
	 * @property CartItem[] Array of cart items
	 */
	this.items = items || [];
}




/**
 * Empty the cart
 */
NTPaypal.Cart.prototype.empty = function(){

	this.items = [];

}



/**
 * Get cart items line count (a product with quantity > 2 counts for 1)
 */
NTPaypal.Cart.prototype.count = function(){

	return this.items.length;
}



/**
 * Add an item to the cart
 *
 * If the product is already in the cart, its quantity is incremented
 *
 * @param CartItem item Instance of CartItem class to describe product added to the cart
 */
NTPaypal.Cart.prototype.add = function(item){
	
	// checking parameters
	if ( !(item instanceof NTPaypal.CartItem) )
		throw new TypeError("'item' parameter of 'Cart.add' method is not an instance of 'CartItem'");
	
	
	// look for item with same id in the cart ; if found, increment quantity or item in cart (ignoring 'item' parameter)
	var item_in_cart = this.search(item.id);
	if ( item_in_cart )
		item_in_cart.quantity++;	
	else
		this.items.push(item);
}



/**
 * Removes an item from the cart (no matter what is its quantity value)
 *
 * @param string id
 */
NTPaypal.Cart.prototype.remove = function(id){
	
	// look for item with same id in the cart ; if found, increment quantity or item in cart (ignoring 'item' parameter)
	var il = this.items.length;
	for ( var i = 0 ; i < il ; i++ )
		if ( this.items[i].id == id )
		{
			this.items.splice(i, 1);
			return;
		}
}



/**
 * Set a quantity for a product already added to the cart
 *
 * @param string id
 * @param int quantity
 */
NTPaypal.Cart.prototype.setQuantity = function(id, quantity){
	
	// look for item
	var item = this.search(id);
	
	if ( !item )
		throw new Error("Item with id='" + id + "' not found in cart");
	
	item.quantity = quantity;
}



/**
 * Look for a product ID that may have already been added to the cart
 *
 * @param string id
 * @return false|CartItem
 */
NTPaypal.Cart.prototype.search = function(id){
		
	var il = this.items.length;
	for ( var i = 0 ; i < il ; i++ )
		if ( this.items[i].id == id )
			return this.items[i];
	
	// if we arrive here, no product with matching id found
	return false;
}



/**
 * Check if a product ID has already been added to the cart
 *
 * @param string id
 * @return bool
 */
NTPaypal.Cart.prototype.contains = function(id){
		
	var il = this.items.length;
	for ( var i = 0 ; i < il ; i++ )
		if ( this.items[i].id == id )
			return true;
	
	// if we arrive here, no product with matching id found
	return false;
}



/**
 * Convert a Cart object to Paypal order / 1 purchase unit
 *
 * @return object Returns a litteral object to be used as a value for 'items' property of a purchase unit struct
 */
NTPaypal.Cart.prototype.toPaypalItems = function()
{
	var ret = [];
	var il = this.items.length;
	for ( var i = 0 ; i < il ; i++ )
		ret.push(this.items[i].toPaypalItem());
	
	
	return ret;
}




// ----------------------------------------------------------------------




/**
 * Order object
 *
 * @param Cart Object of class Cart
 * @param string currency_code
 * @param object other Object litteral with non-mandatory parameters {Customer customer, float shipping, string description}
 */
NTPaypal.Order = function(cart, currency_code, other){

	// normalize 'other' parameter
	var other = other || {};
	
		
	// checking parameters
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Order' constructor is not an instance of 'Cart'");
	
	if ( (typeof(other['customer'])=='object') && !(other['customer'] instanceof NTPaypal.Customer) )
		throw new TypeError("'other.customer' parameter of 'Order' constructor is not an instance of 'Customer'");

	if ( !currency_code )
		throw new Error("'currency_code' parameter of 'Order' constructor not set");
	
	
	this.customer = other['customer'] || null;
	this.cart = cart;	
	this.currency_code = currency_code;
	this.shipping = other['shipping'] || 0;
	this.description = other['description'] || '';
}



/**
 * Convert order to Paypal purchase_unit object litteral
 *
 * @return object
 */
NTPaypal.Order.prototype.toPurchaseUnit = function()
{
	var content = this.cart.toPaypalItems();
	
	// compute total amount
	var itemsl = content.length;
	var item_total = 0;
	var tax_total = 0;
	for ( var i = 0 ; i < itemsl ; i++ )
	{
		item_total += content[i].quantity * content[i].unit_amount.value;
		tax_total += content[i].quantity * content[i].tax.value;
	}
	
	
	
	// prepare object litteral to be returned ; first adding always defined values
	var punit = {
		items : content,
		description : this.description,
		amount : {
			currency_code : this.currency_code,
			value : item_total + tax_total + this.shipping,
			breakdown : {
				item_total : { currency_code : this.currency_code, value : item_total },
				tax_total : { currency_code : this.currency_code, value : tax_total },
				shipping : { currency_code : this.currency_code, value : this.shipping }
			}
		}
	};


	// if customer is known, adding it to request
	if ( this.customer )
		punit.shipping = this.customer.toPaypalShipping();
	
	
	// return purchase_unit struct : items, shipping details (customer address), total amount with breakdown (amount w/o VAT, total VAT, shipping cost)
	return punit;
}



// ----------------------------------------------------------------------



/**
 * Constructor of main facade object, used as a factory to create underlying objects 
 *
 * @param string currency_code 3-characters such as GBP, EUR, USD, etc.
 */
NTPaypal.Shop = function(currency_code)
{
	if ( !currency_code )
		throw new Error("'currency_code' parameter of 'Shop' constructor not set");
	
	this.currency_code = currency_code;
}



/**
 * Create a cart item
 *
 * @param string title Short description of product
 * @param string id Any relevant business ID (EAN, SKU, etc.)
 * @param int quantity Quantity purchased
 * @param float price Price for one product (excluding tax)
 * @param string category Category of goods (DIGITAL_GOODS, PHYSICAL_GOODS, DONATION)
 * @param object other Object litteral of non-mandatory parameters : {float tax, string description}
 * @return CartItem
 */
NTPaypal.Shop.prototype.newItem = function(title, id, quantity, price, category, other)
{
	return new NTPaypal.CartItem(title, id, quantity, price, category, this.currency_code, other);
}



/**
 * Create a customer object, providing details about shipping
 *
 * - Countrycode is a 2-characters string identify country
 * - Phone_type may be set to 'HOME' or 'MOBILE'
 *
 * @param string firstname
 * @param object other Object litteral with non-mandatory parameters {string surname, string address1, string address2, string zipcode, string city, string countrycode, string email, string phone, string phone_type}
 * @return Customer
 */
NTPaypal.Shop.prototype.newCustomer = function(firstname, other)
{
	return new NTPaypal.Customer(firstname, other);
}



/**
 * Create a new Order object
 *
 * @param Cart Object of class Cart
 * @param object other Object litteral with non-mandatory parameters {Customer customer, float shipping, string description}
 * @return Order
 */
NTPaypal.Shop.prototype.newOrder = function(cart, other)
{
	return new NTPaypal.Order(cart, this.currency_code, other);
}



/**
 * Create a shopping cart with items
 *
 * @param CartItem[] items Array of CartItem objects ; content of shopping cart can be set later with add method instead of this items paremeters
 */
NTPaypal.Shop.prototype.newCart = function(items){
	return new NTPaypal.Cart(items);
}




/**
 * Quickly create required objects and show Paypal "buy now" buttons (with some values being forced to default values : tax = 0, description = '')
 *
 * @param string title Short description of item purchased
 * @param float value Amount to ask payment for
 * @param string category Category of goods : PHYSICAL_GOODS, DIGITAL_GOODS, DONATION ; defaults to PHYSICAL_GOODS
 * @param string selector Selector to identify a container in the page to render the button into
 * @return Promise Return a promise resolved when payment is approved, rejected when canceled
 */
NTPaypal.Shop.prototype.expressBuy = function(title, value, category, selector){
	// calling paypalButton method
	return this.paypalButton(
			// building simple order (cart, no customer data, 0 shipping, no description)
			this.newOrder(this.newCart([this.newItem(title, title, 1, value, category || 'PHYSICAL_GOODS')])),

			// DOM selector
			selector
		);
}



/**
 * Show Paypal pay-now button for a given order
 *
 * @param Order order Object of class Order containing all details to fullfill payment
 * @param string selector Selector to identify a container in the page to render the button into
 * @return Promise Return a promise resolved when payment is approved, rejected when canceled
 */
NTPaypal.Shop.prototype.paypalButton = function(order, selector)
{
	try
	{
		// checking parameters
		if ( !(order instanceof NTPaypal.Order) )
			throw new TypeError("'order' parameter of 'paypalButton' function is not an instance of 'Order'");
		if ( !selector )
			throw new Error("'selector' parameter of 'paypalButton' function not set");



		// creating request with relevant objects
		var req = {};
		req.purchase_units = [ order.toPurchaseUnit() ];



		// maybe the customer is not set (no default values in Paypal window)
		if ( order.customer )
		{
			if ( order.customer.email )
			{
				req.payer = req.payer || {};
				req.payer.email_address = order.customer.email;
			}

			if ( order.customer.phone && order.customer.phone_type )
			{
				req.payer = req.payer || {};
				req.payer.phone = {
						phone_number : { national_number : order.customer.phone },
						phone_type : order.customer.phone_type
					};
			}
		}


		// create a Promise to be returned to caller ; resolved when payment is approved, rejected if canceled
		return new Promise(function(resolve, reject){
			paypal.Buttons({

				// create order
				createOrder: function(data, actions) {
					// Set up the transaction
					return actions.order.create(req);
				},


				// capture the payment ; resolve method will be called with order data object litteral ;
				// access transaction id with orderData.purchase_units[0].payments.captures[0].id;
				onApprove: function(data, actions) {
					return actions.order.capture().then(resolve);
				},		


				// react to cancel (reject function will be passed an order ID)
				onCancel : reject,


				// react to error
				onError : reject

			}).render(selector);		
		});
	}
	catch( err )
	{
		return Promise.reject(err);
	}
}

