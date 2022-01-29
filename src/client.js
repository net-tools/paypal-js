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
 * @param float tax VAT amount
 * @param string description Longer description of item (may be null)
 * @param string category Category of goods (DIGITAL_GOODS, PHYSICAL_GOODS, DONATION)
 * @param string currency_code Such as EUR, GBP, USD, etc.
 */
NTPaypal.CartItem = function(title, id, quantity, price, tax, description, category, currency_code){
	
	this.title = title;
	this.id = id;
	this.quantity = quantity;
	this.price = price;
	this.tax = tax || 0;
	this.currency_code = currency_code;
	this.category = category;
	this.description = description || '';
	
	
	if ( !this.title )
		throw new Error("'title' parameter of 'CartItem' constructor not set");
	if ( !this.id )
		throw new Error("'id' parameter of 'CartItem' constructor not set");
	if ( !this.quantity )
		throw new Error("'quantity' parameter of 'CartItem' constructor not set");
	if ( typeof price == 'undefined' )
		throw new Error("'price' parameter of 'CartItem' constructor not set");
	if ( typeof tax == 'undefined' )
		throw new Error("'tax' parameter of 'CartItem' constructor not set");
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
 * @param string firstname
 * @param string surname
 * @param string address1
 * @param string address2
 * @param string zipcode
 * @param string city
 * @param string countrycode 2-characters identifying country
 * @param string email 
 * @param string phone
 * @param string phone_type May be HOME or MOBILE
 */
NTPaypal.Customer = function(firstname, surname, address1, address2, zipcode, city, countrycode, email, phone, phone_type)
{
	this.firstname = firstname;
	this.surname = surname;
	this.address1 = address1;
	this.address2 = address2;
	this.zipcode = zipcode;
	this.city = city;
	this.countrycode = countrycode;
	this.email = email;
	this.phone = phone;
	this.phone_type = phone_type;
}



/**
 * Convert Customer object to paypal shipping_detail object
 *
 * @return object Returns a litteral object to be used as shipping_detail value in Paypal requests
 */
NTPaypal.Customer.prototype.toPaypalShipping = function() {
	return {
		name : { full_name : this.firstname + ' ' + this.surname },
		type : 'SHIPPING',
		address : {
			address_line_1 : this.address1 || '',
			address_line_2 : this.address2 || '',
			admin_area_2 : this.city.toUpperCase(),
			postal_code : this.zipcode,
			country_code : this.countrycode
		}
	}
}




// ----------------------------------------------------------------------




/**
 * Constructor of a shopping cart 
 *
 * @param CartItem[] items Array of CartItem objects ; content of shopping cart can be set later with add method instead of this items paremeters
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
 * @param Customer Object of class Customer
 * @param float shipping Shipping cost for order
 * @param string description Short description of order (may be null)
 * @param string currency_code
 */
NTPaypal.Order = function(cart, customer, shipping, description, currency_code){

	// checking parameters
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Order' constructor is not an instance of 'Cart'");
	
	if ( !(customer instanceof NTPaypal.Customer) )
		throw new TypeError("'customer' parameter of 'Order' constructor is not an instance of 'Customer'");

	if ( !currency_code )
		throw new Error("'currency_code' parameter of 'Order' constructor not set");
	
	this.customer = customer;
	this.cart = cart;	
	this.currency_code = currency_code;
	this.shipping = shipping || 0;
	this.description = description;
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
	
	
	// return purchase_unit struct : items, shipping details (customer address), total amount with breakdown (amount w/o VAT, total VAT, shipping cost)
	return {
		items : content,
		shipping : this.customer.toPaypalShipping(),
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
	}
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
 * @param float tax VAT amount
 * @param string description Longer description of item (may be null)
 * @param string category Category of goods (DIGITAL_GOODS, PHYSICAL_GOODS, DONATION)
 * @return CartItem
 */
NTPaypal.Shop.prototype.newItem = function(title, id, quantity, price, tax, description, category)
{
	return new NTPaypal.CartItem(title, id, quantity, price, tax, description, category, this.currency_code);
}



/**
 * Create a customer object, providing details about shipping
 *
 * @param string firstname
 * @param string surname
 * @param string address1
 * @param string address2
 * @param string zipcode
 * @param string city
 * @param string countrycode 2-characters identifying country
 * @param string email
 * @param string phone
 * @param string phone_type May be HOME or MOBILE
 * @return Customer
 */
NTPaypal.Shop.prototype.newCustomer = function(firstname, surname, address1, address2, zipcode, city, countrycode, email, phone, phone_type)
{
	return new NTPaypal.Customer(firstname, surname, address1, address2, zipcode, city, countrycode, email, phone, phone_type);
}



/**
 * Create a new Order object
 *
 * @param Cart Object of class Cart
 * @param Customer Object of class Customer
 * @param float shipping Shipping cost for order
 * @param string description Short description of order (may be null)
 * @return Order
 */
NTPaypal.Shop.prototype.newOrder = function(cart, customer, shipping, description)
{
	return new NTPaypal.Order(cart, customer, shipping, description, this.currency_code);
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
 * Show Paypal pay-now button for a given order
 *
 * @param Order order Object of class Order containing all details to fullfill payment
 * @param string selector Selector to identify a container in the page to render the button into
 * @return Promise Return a promise resolved when payment is approved, rejected when canceled
 */
NTPaypal.Shop.prototype.paypalButton = function(order, selector)
{
	// checking parameters
	if ( !(order instanceof NTPaypal.Order) )
		throw new TypeError("'order' parameter of 'paypalButton' function is not an instance of 'Order'");
	if ( !selector )
		throw new Error("'selector' parameter of 'paypalButton' function not set");
		
	
	// create a Promise to be returned to caller ; resolved when payment is approved, rejected if canceled
	return new Promise(function(resolve, reject){
		paypal.Buttons({
			
			// create order
			createOrder: function(data, actions) {
				// Set up the transaction
				return actions.order.create(
					{
						// data about payer/customer ; used to set fields with relevant data already known
						payer : {
							email_address : order.customer.email,
							phone : {
								phone_number : { national_number : order.customer.phone },
								phone_type : order.customer.phone_type
							}
						},
						
						// shopping cart content
						purchase_units: [ order.toPurchaseUnit() ]
					}
				);
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

