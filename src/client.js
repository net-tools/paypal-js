'use strict';

// library namespace
var NTPaypal = NTPaypal || {};





/**
 * Constructor for a cart item
 *
 * @param string title Short description of product
 * @param float price Price for one product (excluding tax)
 * @param string category Category of goods (DIGITAL_GOODS, PHYSICAL_GOODS, DONATION)
 * @param string currency_code Such as EUR, GBP, USD, etc.
 * @param object other Object litteral of non-mandatory parameters : {string sku, float tax, string description}
 */
NTPaypal.Product = function(title, price, category, currency_code, other){
	
	// normalize other parameter
	other = other || {};
	
	this.title = title;
	this.price = price;
	this.category = category;
	this.tax = other.tax || 0;
	this.description = other.description || '';
	this.sku = other.sku || '';
	this.currency_code = currency_code;
	
	
	if ( !this.title )
		throw new Error("'title' parameter of 'Product' constructor not set");
	if ( typeof price == 'undefined' )
		throw new Error("'price' parameter of 'Product' constructor not set");
	if ( typeof category == 'undefined' )
		throw new Error("'category' parameter of 'Product' constructor not set");
	if ( !this.currency_code )
		throw new Error("'currency_code' parameter of 'Product' constructor not set");
	if ( this.quantity <= 0 )
		throw new Error("'quantity' parameter of 'Product' constructor is not in the allowed range");
}



/**
 * Static method to create an instance from a litteral object (read from json data)
 *
 * @param object obj
 */
NTPaypal.Product.fromJson = function(obj)
{
	if ( typeof(obj) != 'object' )
		throw new TypeError("'obj' parameter of 'Product.fromJson' static method is not an object litteral");

	
	// create an empty object (can't call regular constructor, as we don't know it's values yet)
	var o = Object.create(NTPaypal.Product.prototype);
	
	// takes proprerty values from litteral object
	o.title = obj.title;
	o.price = obj.price;
	o.category = obj.category;
	o.tax = obj.tax;
	o.withDescription = obj.description;
	o.sku = obj.sku;
	o.currency_code = obj.currency_code;
	
	
	return o;
}



/**
 * Convert a Product object to a Paypal item
 *
 * @return object
 */
NTPaypal.Product.prototype.toPaypalItem = function()
{
	return {
		name : this.title,
		unit_amount : {currency_code: this.currency_code, value:this.price},
		tax : {currency_code : this.currency_code, value:this.tax},
		description: this.description,
		sku : this.sku,
		category : this.category
	}
}



/**
 * Fluent method to set non-mandatory parameter tax
 *
 * @param float tax
 * @return Product
 */
NTPaypal.Product.prototype.setTax = function(tax)
{
	this.tax = tax;
	return this;
}



/**
 * Fluent method to set non-mandatory parameter sku
 *
 * @param string sku
 * @return Product
 */
NTPaypal.Product.prototype.setSku = function(sku)
{
	this.sku = sku;
	return this;
}



/**
 * Fluent method to set non-mandatory parameter description
 *
 * @param string description
 * @return Product
 */
NTPaypal.Product.prototype.withDescription = function(description)
{
	this.description = description;
	return this;
}



/**
 * Fluent method to set quantity, although returning a ProductQuantity, thus preventing further chaining on Product methods
 *
 * @param int n
 * @return ProductQuantity
 */
NTPaypal.Product.prototype.setQuantity = function(n)
{
	return new NTPaypal.ProductQuantity(this, n);
}



// ----------------------------------------------------------------------



/**
 * Constructor for a product associated to a quantity (to be used in stock or cart management)
 *
 * @param Product product object
 * @param int quantity
 */
NTPaypal.ProductQuantity = function(product, quantity)
{
	if ( !(product instanceof NTPaypal.Product) )
		throw new TypeError("'item' parameter of 'ProductQuantity' constructor is not a Product instance");

	
	this.product = product;
	this.quantity = quantity || 0;
}



/**
 * Static method to create a ProductQuantity object from an object litteral (json)
 *
 * @param object obj
 * @return ProductQuantity
 */
NTPaypal.ProductQuantity.fromJson = function(obj)
{
	if ( typeof(obj) != 'object' )
		throw new TypeError("'obj' parameter of 'ProductQuantity.fromJson' static method is not an object litteral");

	if ( !obj.product || !obj.product.sku )
		throw new Error("'sku' property for product '" + obj.product.title + "' is mandatory when creating ProductQuantity object");

	
	// create an empty object (can't call regular constructor, as we don't know it's values yet)
	var o = Object.create(NTPaypal.ProductQuantity.prototype);
	o.product = NTPaypal.Product.fromJson(obj.product);
	o.quantity = obj.quantity;
	
	return o;
}



/**
 * Convert product quantity object to Paypal object litteral
 *
 * @return object
 */
NTPaypal.ProductQuantity.prototype.toPaypalItem = function()
{
	var ret = this.product.toPaypalItem();
	ret.quantity = this.quantity;
	
	return ret;
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
	var other = other || {};

	
	if ( !firstname )
		throw new Error("'firstname' parameter of 'Customer' constructor not set");
	if ( (other.phone && !other.phone_type) || (!other.phone && other.phone_type) )
		throw new Error("'other.phone' and 'other.phone_type' parameters of 'Customer' constructor not set");
	if ( other.city || other.zipcode || other.countrycode )
	{
		if ( !other.city || !other.zipcode || !other.countrycode )
			throw new Error("'other.city', 'other.zipcode' and 'other.countrycode' parameters of 'Customer' constructor not set");
	}
	
	
	this.firstname = firstname;
	this.surname = other.surname || '';
	this.address1 = other.address1 || '';
	this.address2 = other.address2 || '';
	this.zipcode = other.zipcode || '';
	this.city = other.city || '';
	this.countrycode = other.countrycode || '';
	this.email = other.email || '';
	this.phone = other.phone || '';
	this.phone_type = other.phone_type || '';
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



/**
 * Fluent method to set firstname, surname
 *
 * @param string firstname
 * @param string surname
 * @return Customer Returns this
 */
NTPaypal.Customer.prototype.named = function(firstname, surname){
	this.firstname = firstname;
	this.surname = surname;
	return this;
}



/**
 * Fluent method to set address1 and address2
 *
 * @param string address1
 * @param string address2
 * @return Customer Returns this
 */
NTPaypal.Customer.prototype.living = function(address1, address2){
	this.address1 = address1;
	this.address2 = address2;
	return this;
}



/**
 * Fluent method to set zipcode, city, countrycode
 *
 * @param string zipcode
 * @param string city
 * @param string countrycode
 * @return Customer Returns this
 */
NTPaypal.Customer.prototype.in = function(zipcode, city, countrycode){
	this.zipcode = zipcode;
	this.city = city;
	this.countrycode = countrycode;
	return this;
}



/**
 * Fluent method to set phone / phone_type
 *
 * @param string phone
 * @param string phone_type (MOBILE or HOME)
 * @return Customer Returns this
 */
NTPaypal.Customer.prototype.withPhone = function(phone, phone_type){
	this.phone = phone;
	this.phone_type = phone_type;
	return this;
}



/**
 * Fluent method to set email address
 *
 * @param string email
 * @return Customer Returns this
 */
NTPaypal.Customer.prototype.withEmail = function(email){
	this.email = email;
	return this;
}



// ----------------------------------------------------------------------



/**
 * Constructor of a ProductQuantity objects list
 *
 * @param null|ProductQuantity[] items Array of ProductQuantity objects ; content of shopping cart can be set later with add method instead of this items paremeters
 */
NTPaypal.Inventory = function(items){
	
	if ( (typeof(items) == 'object') && (items.constructor.name != 'Array') )
		throw new TypeError("'items' parameter of 'Inventory' constructor is not an array");
	

	// checking array content
	if ( items.length && !(items[0] instanceof NTPaypal.ProductQuantity) )
		throw new TypeError("'items' parameter of 'Inventory' constructor is not an array of ProductQuantity objects");
	
	
	this.items = items || [];
}



/**
 * Static method to create an instance from a litteral object (read from json data)
 *
 * @param object obj
 * @throws SyntaxError Raised if json string is malformed
 */
NTPaypal.Inventory.fromJson = function(obj)
{
	if ( typeof(obj) != 'object' )
		throw new TypeError("'obj' parameter of 'Inventory.fromJson' static method is not an object litteral");


	// create an empty object (can't call regular constructor, as we don't know it's values yet)
	var o = Object.create(NTPaypal.Inventory.prototype);
	
	// takes property values from litteral object
	// currently, obj.items is an array of object litteral, not ProductQuantity objects
	o.items = obj.items.map(function(value){ return NTPaypal.ProductQuantity.fromJson(value); });
		
	return o;
}



/**
 * Empty the list
 */
NTPaypal.Inventory.prototype.empty = function(){

	this.items = [];

}



/**
 * Get items count (a product with quantity >= 2 counts for 1)
 *
 * @return int
 */
NTPaypal.Inventory.prototype.count = function(){

	return this.items.length;
}



/**
 * Add an item (Product object) to the inventory, with a given quantity
 *
 * If the product is already in the inventory, its quantity is incremented by n
 *
 * @param Product item Product object to add to the cart
 * @param int n Number of items to add (default 1)
 */
NTPaypal.Inventory.prototype.add = function(item, n){
	
	// checking parameters
	if ( !(item instanceof NTPaypal.Product) )
		throw new TypeError("'item' parameter of 'Inventory.add' method is not an instance of 'Product'");
	
	
	var n = n || 1;
	
	
	try
	{
		// look for item with same id in the cart ; if found, increment quantity of item in cart
		var prod_quantity = this.get(item.sku);
		prod_quantity.quantity = prod_quantity.quantity + n;
	}
	catch ( err )
	{
		// item not found, adding it to the cart
		this.items.push(new NTPaypal.ProductQuantity(item, n));
	}
}



/**
 * Removes an item from the inventory (no matter what is its quantity value)
 *
 * @param string sku
 */
NTPaypal.Inventory.prototype.remove = function(sku){
	
	// look for item with same sku in the cart ; if found, removing all quantities
	var il = this.items.length;
	for ( var i = 0 ; i < il ; i++ )
		if ( this.items[i].product.sku == sku )
		{
			this.items.splice(i, 1);
			return;
		}
}



/**
 * Set a quantity for a product already added to the inventory
 *
 * @param string sku
 * @param int quantity
 */
NTPaypal.Inventory.prototype.setQuantity = function(sku, quantity){
	
	// look for item
	this.get(sku).quantity = quantity;
}



/**
 * Look for a product SKU that may have already been added to the inventory
 *
 * @param string sku
 * @return ProductQuantity
 * @throw Error Thrown if item with given SKU not found
 */
NTPaypal.Inventory.prototype.get = function(sku){
		
	var il = this.items.length;
	for ( var i = 0 ; i < il ; i++ )
		if ( this.items[i].product.sku == sku )
			return this.items[i];
	
	// if we arrive here, no product with matching sku found
	throw new Error("Item with sku='" + sku + "' not found in inventory");
}



/**
 * Check if a product SKU has already been added to the inventory
 *
 * @param string sku
 * @return bool
 */
NTPaypal.Inventory.prototype.contains = function(sku){
		
	var il = this.items.length;
	for ( var i = 0 ; i < il ; i++ )
		if ( this.items[i].product.sku == sku )
			return true;
	
	// if we arrive here, no product with matching sku found
	return false;
}



// ----------------------------------------------------------------------



/**
 * Constructor of a Cart object
 *
 * @param null|ProductQuantity[] items Array of ProductQuantity objects ; content of shopping cart can be set later with add method instead of this items paremeters
 */
NTPaypal.Cart = function(items){
	
	this.inventory = new NTPaypal.Inventory(items);
}



/**
 * Static method to create an instance from a litteral object (read from json data)
 *
 * @param string jsonString
 * @throws SyntaxError Raised if json string is malformed
 */
NTPaypal.Cart.fromJson = function(jsonString)
{
	if ( typeof(jsonString) != 'string' )
		throw new TypeError("'jsonString' parameter of 'Cart.fromJson' static method is not a string");
	
	
	var obj = JSON.parse(jsonString);
	
		
	// create an empty object (can't call regular constructor, as we don't know it's values yet)
	var o = Object.create(NTPaypal.Cart.prototype);
	
	// takes property values from litteral object
	// currently, obj.items is an array of object litteral, not ProductQuantity objects
	o.inventory = NTPaypal.Inventory.fromJson(obj.inventory);
		
	return o;
}



/**
 * Empty the cart
 */
NTPaypal.Cart.prototype.empty = function(){

	return this.inventory.empty();
}



/**
 * Get items count (a product with quantity >= 2 counts for 1)
 *
 * @return int
 */
NTPaypal.Cart.prototype.count = function(){

	return this.inventory.count();
}



/**
 * Add an item (Product object) to the cart, with a given quantity
 *
 * If the product is already in the cart, its quantity is incremented by n
 *
 * @param Product item Product object to add to the cart
 * @param int n Number of items to add (default 1)
 */
NTPaypal.Cart.prototype.add = function(item, n){
	
	return this.inventory.add(item, n);
}



/**
 * Removes an item from the cart (no matter what is its quantity value)
 *
 * @param string sku
 */
NTPaypal.Cart.prototype.remove = function(sku){
	
	return this.inventory.remove(sku);
}



/**
 * Set a quantity for a product already added to the cart
 *
 * @param string sku
 * @param int quantity
 */
NTPaypal.Cart.prototype.setQuantity = function(sku, quantity){
	
	return this.inventory.setQuantity(sku, quantity);
}



/**
 * Look for a product SKU that may have already been added to the cart
 *
 * @param string sku
 * @return ProductQuantity
 * @throw Error Thrown if item with given SKU not found
 */
NTPaypal.Cart.prototype.get = function(sku){
		
	return this.inventory.get(sku);
}



/**
 * Check if a product SKU has already been added to the cart
 *
 * @param string sku
 * @return bool
 */
NTPaypal.Cart.prototype.contains = function(sku){

	return this.inventory.contains(sku);
}



/**
 * Convert a Cart object to Paypal order / 1 purchase unit
 *
 * @return object Returns a litteral object to be used as a value for 'items' property of a purchase unit struct
 */
NTPaypal.Cart.prototype.toPaypalItems = function()
{
	var ret = [];
	var il = this.count();
	for ( var i = 0 ; i < il ; i++ )
		ret.push(this.inventory.items[i].toPaypalItem());
	
	
	return ret;
}



// ----------------------------------------------------------------------



/**
 * Order object
 *
 * @param Cart Object of class Cart
 * @param string currency_code
 * @param object other Object litteral with non-mandatory parameters {Customer customer, float shipping, string description, string custom_id}
 */
NTPaypal.Order = function(cart, currency_code, other){

	// normalize 'other' parameter
	var other = other || {};
	
		
	// checking parameters
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Order' constructor is not an instance of 'Cart'");
	
	if ( (typeof(other.customer)=='object') && !(other.customer instanceof NTPaypal.Customer) )
		throw new TypeError("'other.customer' parameter of 'Order' constructor is not an instance of 'Customer'");
	
	if ( other.customer && !(typeof(other.customer)=='object') )
		throw new TypeError("'other.customer' parameter of 'Order' constructor is not an instance of 'Customer'");

	if ( !currency_code )
		throw new Error("'currency_code' parameter of 'Order' constructor not set");
	
	
	this.customer = other.customer || null;
	this.cart = cart;	
	this.currency_code = currency_code;
	this.shipping = other.shipping || 0;
	this.description = other.description || '';
	this.custom_id = other.custom_id || null;
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
	
	
	// if custom_id set
	if ( this.custom_id )
		punit.custom_id = this.custom_id;	
	
	
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
 * Create a product
 *
 * @param string title Short description of product
 * @param float price Price for one product (excluding tax)
 * @param string category Category of goods (DIGITAL_GOODS, PHYSICAL_GOODS, DONATION)
 * @param object other Object litteral of non-mandatory parameters : {string sku, float tax, string description}
 * @return Product
 */
NTPaypal.Shop.prototype.newProduct = function(title, price, category, other)
{
	return new NTPaypal.Product(title, price, category, this.currency_code, other);
}



/**
 * Create a product quantity objet
 *
 * @param Product product
 * @param int quantity
 * @return ProductQuantity
 */
NTPaypal.Shop.prototype.newProductQuantity = function(product, quantity)
{
	return new NTPaypal.ProductQuantity(product, quantity);
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
 * @param object other Object litteral with non-mandatory parameters {Customer customer, float shipping, string description, string custom_id}
 * @return Order
 */
NTPaypal.Shop.prototype.newOrder = function(cart, other)
{
	return new NTPaypal.Order(cart, this.currency_code, other);
}



/**
 * Create a shopping cart with ProductQuantity objects
 *
 * @param ProductQuantity[] items Array of ProductQuantity objects
 */
NTPaypal.Shop.prototype.newCart = function(items){
	return new NTPaypal.Cart(items);
}




/** TODO
 * Quickly create required objects and show Paypal "buy now" buttons (with some values being forced to default values : tax = 0, description = '')
 *
 * @param string title Short description of item purchased
 * @param float value Amount to ask payment for
 * @param string category Category of goods : PHYSICAL_GOODS, DIGITAL_GOODS, DONATION ; defaults to PHYSICAL_GOODS
 * @param string selector Selector to identify a container in the page to render the button into
 * @return Promise Return a promise resolved when payment is approved, rejected when canceled
 */
NTPaypal.Shop.prototype.expressButtons = function(title, value, category, selector){
	// calling paypalButton method
	return this.paypalButtons(
			// building simple order (cart, no customer data, 0 shipping, no description)
			this.newOrder(this.newCart([this.newProductQuantity(this.newProduct(title, value, category || 'PHYSICAL_GOODS'), 1)])),

			// DOM selector
			selector
		);
}



/**
 * Show Paypal pay-now buttons for a given order
 *
 * @param Order order Object of class Order containing all details to fullfill payment
 * @param string selector Selector to identify a container in the page to render the button into
 * @param object application_context Object litteral with application context parameters
 * @return Promise Return a promise resolved when payment is approved, rejected when canceled
 */
NTPaypal.Shop.prototype.paypalButtons = function(order, selector, application_context)
{
	try
	{
		// checking parameters
		if ( !(order instanceof NTPaypal.Order) )
			throw new TypeError("'order' parameter of 'Shop.paypalButton' function is not an instance of 'Order'");
		if ( !selector )
			throw new Error("'selector' parameter of 'Shop.paypalButton' function not set");



		// creating request with relevant objects
		var req = {};
		req.purchase_units = [ order.toPurchaseUnit() ];
		
		
		// if app_ctx defined
		if ( application_context )
			req.application_context = application_context;


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



/**
 * Create a Product object through a fluent method
 *
 * Same parameters as NTPaypal.Shop.newProduct method
 *
 * @param string title Short description of product
 * @param float price Price for one product (excluding tax)
 * @param string category Category of goods (DIGITAL_GOODS, PHYSICAL_GOODS, DONATION)
 * @param object other Object litteral of non-mandatory parameters : {string sku, float tax, string description}
 * @return Product
 */
NTPaypal.Shop.prototype.product = NTPaypal.Shop.prototype.newProduct;



/**
 * Create a ProductQuantity object through a fluent method
 *
 * @param int quantity
 * @param Product product
 * @return ProductQuantity
 */
NTPaypal.Shop.prototype.quantityOf = function(quantity, product)
{
	return this.newProductQuantity(product, quantity);
}



/**
 * Create a Customer object through a fluent method
 *
 * On the returned Customer object, call `named`, `living`, `in`, `withPhone` and `withEmail` fluent methods to set data
 *
 * @return Customer
 */
NTPaypal.Shop.prototype.customer = function()
{
	return new NTPaypal.Customer('no name');
}



/**
 * Provides a method to start a fluent chain
 *
 * @param Cart|Product|ProductQuantity|ProductQuantity[] items Cart object OR Object of class Product (assuming quantity = 1) OR ProductQuantity object OR array of ProductQuantity objects to begin the fluent chain with
 * @return Sale Returns a fluent Sale object with appropriate methods to set customer details, shipping and description data
 */
NTPaypal.Shop.prototype.sell = function(items)
{
	// create Sale object and link it to this (Shop)
	var sale = new NTPaypal.Sale(this);
	
	
	// if we have a single Cart object, associate it with Sale object created
	if ( (typeof(items) == 'object') && (items instanceof NTPaypal.Cart) )
	{
		sale.cart = items;
		return sale;
	}

	
	
	// if we have a single Product object, create ProductQuantity object, with quantity set to 1
	if ( (typeof(items) == 'object') && (items instanceof NTPaypal.Product) )
		items = [this.newProductQuantity(items, 1)];

	
	// if we have a single ProductQuantity object, create an array
	if ( (typeof(items) == 'object') && (items instanceof NTPaypal.ProductQuantity) )
		items = [items];


	// checking we have an array, otherwise, it's an error
	if ( !((typeof(items) == 'object') && (items.constructor.name == 'Array')) )
		throw new TypeError("'items' parameter of 'Shop.sell' method is not an array");
		
	// checking we have an array, otherwise, it's an error
	if ( items.length && !(items[0] instanceof NTPaypal.ProductQuantity) )
		throw new TypeError("'items' parameter of 'Shop.sell' method is not an array of ProductQuantity objects");
		

	sale.cart = this.newCart(items);
	return sale;
}



// ----------------------------------------------------------------------



/**
 * Constructor for fluent object return by Shop.sell ; the object stores the cart, customer and options data
 *
 * @param Shop shop Object reference to the related Shop object
 */
NTPaypal.Sale = function(shop){
	this.shop = shop;
	this.cart = null;
	this.customer = null;
	this.shipping = 0;
	this.description = '';	
	this.custom_id = null;
}



/** 
 * Provides a fluent method to set the customer linked to the sale object
 *
 * @param Customer customer 
 * @return Sale Return this
 */
NTPaypal.Sale.prototype.to = function (customer){

	// checking parameter
	if ( customer && !(customer instanceof NTPaypal.Customer) )
		throw new TypeError("'customer' parameter of 'Sale.to' method is not an instance of 'Customer'");

	this.customer = customer;
	return this;
}



/** 
 * Provides a fluent method to set the shipping cost linked to the sale object
 *
 * @param float cost
 * @return Sale Return this
 */
NTPaypal.Sale.prototype.withShipping = function (cost){

	this.shipping = cost;
	return this;
}



/** 
 * Provides a fluent method to set the description linked to the sale object
 *
 * @param string description
 * @return Sale Return this
 */
NTPaypal.Sale.prototype.withDescription = function (description){

	this.description = description;
	return this;
}



/** 
 * Provides a fluent method to set a custom_id value linked to the sale object
 *
 * @param string custom_id
 * @return Sale Return this
 */
NTPaypal.Sale.prototype.withCustom_id = function (custom_id){

	this.custom_id = custom_id;
	return this;
}



/** 
 * Provides a fluent method to close the order building process ; we return a Payment fluent object to pass control to buttons and app context building
 *
 * @param string selector Selector to identify a container in the page to render the button into
 * @return Payment Returns a fluent object to deal with application context before displaying Paypal buttons
 */
NTPaypal.Sale.prototype.payButtonsInside = function (selector){

	// checking parameter
	if ( !(typeof (selector) == 'string') )
		throw new TypeError("'selector' parameter of 'Sale.payButtonsInside' method is not a string");

	if ( !selector )
		throw new TypeError("'selector' parameter of 'Sale.payButtonsInside' method is not set");

	return new NTPaypal.Payment(selector, this);
}



// ----------------------------------------------------------------------



/**
 * Constructor for object used in a fluent pattern to store payment details after order created and before buttons are displayed 
 *
 * @param string selector Id of DOM object to display Paypal buttons into
 * @param Sale sale Sale fluent object
 */
NTPaypal.Payment = function(selector, sale){
	this.sale = sale;
	this.selector = selector;
	this.application_context = null;
}



/**
 * Fluent method to set one application context parameter
 *
 * @param string key
 * @param string value
 * @return Payment Returns this
 */
NTPaypal.Payment.prototype.set = function(key, value) {
	
	// checking parameters
	if ( !key || typeof(key) != 'string' )
		throw new TypeError("'key' parameter of 'Payment.set' method is not set or not of type 'string'");
		
	this.application_context = this.application_context || {};
	this.application_context[key] = value;
	return this;
}



/**
 * Fluent method to set application context parameters in one call
 *
 * @param object
 * @return Payment Returns this
 */
NTPaypal.Payment.prototype.withApplicationContext = function(values) {
	
	// checking parameters
	if ( !(typeof values == 'object') )
		throw new TypeError("'values' parameter of 'Payment.withApplicationContext' method is not an object");
		
	this.application_context = values;
	return this;
}



/**
 * Fluent method to close bulding buttons process
 *
 * @return Promise Return a promise resolved when payment is approved, rejected when canceled
 */
NTPaypal.Payment.prototype.execute = function() {
	
	// prepare order non-mandatory parameters
	var orderData = {};
	if ( this.sale.customer )
		orderData.customer = this.sale.customer;
	if ( this.sale.shipping )
		orderData.shipping = this.sale.shipping;
	if ( this.sale.description )
		orderData.description = this.sale.description;
	if ( this.sale.custom_id )
		orderData.custom_id = this.sale.custom_id;
	
	
	// display paypal buttons
	return this.sale.shop.paypalButtons(
			
			// creating the order object
			this.sale.shop.newOrder(this.sale.cart, orderData),
		
			
			// selector
			this.selector,
		
		
			// application_context
			this.application_context		
		);
}


