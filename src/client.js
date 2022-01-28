'use strict';

// library namespace
var NTPaypal = NTPaypal || {};





/**
 * Constructor for a cart item
 *
 * @param string title Short description of product
 * @param string id Any relevant business ID (EAN, SKU, etc.)
 * @param int quantity Quantity purchased
 * @param price Price for one product (excluding tax)
 * @param tax VAT amount
 */
NTPaypal.CartItem = function(title, id, quantity, price, tax){
	
	this.title = title;
	this.id = id;
	this.quantity = quantity;
	this.price = price;
	this.tax = tax || 0;
	
	
	if ( !this.title )
		throw new Error("'title' parameter of 'CarItem' constructor not set");
	if ( !this.id )
		throw new Error("'id' parameter of 'CarItem' constructor not set");
	if ( !this.quantity )
		throw new Error("'quantity' parameter of 'CarItem' constructor not set");
	if ( !this.price )
		throw new Error("'price' parameter of 'CarItem' constructor not set");
	if ( !this.quantity <= 0 )
		throw new Error("'quantity' parameter of 'CarItem' constructor is not in the allowed range");
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
		unit_amount : this.price,
		tax : this.tax,
		quantity : this.quantity,
		sku : this.id,
		category : 'PHYSICAL_GOODS'
	}
}




// ----------------------------------------------------------------------



/**
 * Constructor for a customer object, providing details about shipping
 */
NTPaypal.Customer = function(firstname, surname, address1, adresse2, zipcode, city, countrycode)
{
	this.firstname = firstname;
	this.surname = surname;
	this.address1 = address1;
	this.address2 = adresse2;
	this.zipcode = zipcode;
	this.city = city;
	this.countrycode = countrycode;
}



/**
 * Convert Customer object to paypal shipping_detail object
 *
 * @return object Returns a litteral object to be used as shipping_detail value in Paypal requests
 */
NTPaypal.Customer.prototype.toPaypalShippingDetail = function() {
	return {
		name : { full_name : this.firstname + ' ' + this.surname },
		type : 'SHIPPING',
		address : {
			address_line_1 : this.address1 || '',
			address_line_2 : this.address2 || '',
			admin_area_2 : this.city.toUpperCase(),
			postal_code : this.city.zipcode,
			country_code : this.countrycode
		}
	}
}




// ----------------------------------------------------------------------




/**
 * Constructor of a shopping cart 
 */
NTPaypal.Cart = function(){
	
	/**
	 * @property CartItem[] Array of cart items
	 */
	this.items = [];
}




/**
 * Empty the cart
 */
NTPaypal.Cart.prototype.empty = function(){

	this.items = [];
	this.customer = null;
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
		throw new TypeError("'Item' parameter of 'Cart.add' method is not an instance of 'CartItem'");
	
	
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












