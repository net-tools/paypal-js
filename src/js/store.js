'use strict';



// checking client.js is known
if ( typeof NTPaypal != 'object' )
	throw new Error('client.js script is mandatory and a dependency of store.js');




/**
 * Constructor of a Store object
 *
 * @param null|ProductQuantity[] items Array of ProductQuantity objects ; content of stock can be set later with add method instead of this items paremeters
 */
NTPaypal.Store = function(items){
	
	this.inventory = new NTPaypal.Inventory(items);
}



/**
 * Static method to create an instance from a litteral object (read from json data)
 *
 * @param string jsonString
 * @throws SyntaxError Raised if json string is malformed
 */
NTPaypal.Store.fromJson = function(jsonString)
{
	if ( typeof(jsonString) != 'string' )
		throw new TypeError("'jsonString' parameter of 'Store.fromJson' static method is not a string");
	
	
	var obj = JSON.parse(jsonString);
	
		
	// create an empty object (can't call regular constructor, as we don't know it's values yet)
	var o = Object.create(NTPaypal.Store.prototype);
	
	// takes property values from litteral object
	// currently, obj.items is an array of object litteral, not ProductQuantity objects
	o.inventory = NTPaypal.Inventory.fromJson(obj.inventory);
		
	return o;
}



/**
 * Look for a product SKU that may have already been added to the store stock
 *
 * @param string sku
 * @return ProductQuantity
 * @throw Error Thrown if item with given SKU not found
 */
NTPaypal.Store.prototype.get = function(sku){
		
	return this.inventory.get(sku);
}



/**
 * Add a product from store to a shopping cart
 *
 * @param string sku
 * @param Cart cart
 * @return bool Returns false if product quantity is 0, preventing item to be added to the cart
 * @throw Error Raised if product with given sku doesn't exist in store
 */
NTPaypal.Store.prototype.addToCart = function(sku, cart)
{
	// checking parameter
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Store.addToCart' method is not a Cart instance");
	
	
	// get product stock details (get a ProductQuantity object with property product and quantity)
	var p_store = this.get(sku);
	
	// if stock > 0, that's ok, we can move 1 item to the cart (quantity minus 1)
	if ( p_store.quantity > 0 )
	{
		// adding to cart
		cart.add(p_store.product, 1);
		
		// quantity adjustment in store
		p_store.quantity--;
		return true;
	}
	else
		return false;
}



/**
 * Move back a product from shopping cart to stock (item removed from cart by user) ; all items of same product are removed
 *
 * @param string sku
 * @param Cart cart
 * @throw Error Raised if product with given sku doesn't exist in cart or store
 */
NTPaypal.Store.prototype.removeFromCart = function(sku, cart)
{
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Store.removeFromCart' method is not a Cart instance");

	
	// adjust quantities in store
	var p_store = this.get(sku);
	p_store.quantity = p_store.quantity + cart.get(sku).quantity;
	
	// removing all quantities of this product from cart
	cart.remove(sku);	
}



/**
 * Update quantity of a product in cart, checking stock in store
 *
 * @param string sku
 * @param int quantity New quantity for product identified by sku parameter in the cart
 * @param Cart cart
 * @return bool Returns false if quantities don't match store (= stock) quantities
 * @throw Error Raised if product with given sku doesn't exist in store
 */
NTPaypal.Store.prototype.setCartQuantity = function(sku, quantity, cart)
{
	// checking parameter
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Store.setCartQuantity' method is not a Cart instance");
	
	
	// computing total amount of product available (quantity in store + quantity moved to cart)
	var p_store = this.get(sku);
	var total_amount = p_store.quantity + cart.get(sku).quantity;
	
	// asking for too much amount
	if ( quantity > total_amount )
		return false;
	
	
	// otherwise, update quantities in cart
	cart.setQuantity(sku, quantity);
	
	// and decrement quantity in store
	p_store.quantity = total_amount - quantity;
	return true;
}



/**
 * Update a product quantity in shopping cart by an amount of N items, checking store stock
 *
 * @param string sku
 * @param int amount
 * @param Cart cart
 * @return bool Returns false if product quantity available doesn't match amount of products in store
 * @throw Error Raised if product with given sku doesn't exist in store
 */
NTPaypal.Store.prototype.updateCartQuantity = function(sku, amount, cart)
{
	// checking parameter
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Store.updateCartQuantity' method is not a Cart instance");
	
	
	// get new quantity
	var n = cart.get(sku).quantity + amount;
	
	// if quantity = 0, removing all items from cart, that's easy
	if ( n == 0 )
	{
		this.removeFromCart(sku, cart);
		return true;
	}
	
	
	// otherwise, call setCartQuantity with appropriate amount
	return this.setCartQuantity(sku, n, cart);
}



// ----------------------------------------------------------------------



/**
 * Base class defining methods for storing / restoring data from browser (cookies, sessionStorage, localStorage, etc.)
 */
NTPaypal.BrowserStorage = function()
{	
}



/** 
 * Abstract method for saving a value to storage
 *
 * @param string key
 * @param string value
 */
NTPaypal.BrowserStorage.prototype.set = function(key, value){
	throw new Error("'set' method not implemented in class '" + this.constructor.name + "'");
}



/** 
 * Abstract method for getting a value from storage
 *
 * @param string key
 * @return string
 */
NTPaypal.BrowserStorage.prototype.get = function(key){
	throw new Error("'get' method not implemented in class '" + this.constructor.name + "'");
}



/** 
 * Checking if a key exists in storage
 *
 * @param string key
 * @return bool Returns true if key exists (with value other than null)
 */
NTPaypal.BrowserStorage.prototype.test = function(key){
	return this.get(key) != null;
}



// ----------------------------------------------------------------------



/**
 * Class defining methods for storing / restoring data from browser localStorage
 */
NTPaypal.LocalStorage = function()
{	
    nettools.jscore.oop.parentConstructor(NTPaypal.LocalStorage, this);
}
nettools.jscore.oop.extend(NTPaypal.LocalStorage, NTPaypal.BrowserStorage);


/** 
 * Saving a value to storage
 *
 * @param string key
 * @param string value
 */
NTPaypal.LocalStorage.prototype.set = function(key, value){
	return window.localStorage.setItem(key, value);
}



/** 
 * Getting a value from storage
 *
 * @param string key
 * @return string
 */
NTPaypal.LocalStorage.prototype.get = function(key){
	return window.localStorage.getItem(key);
}



// ----------------------------------------------------------------------



/**
 * Class defining methods for storing / restoring data from browser sessionStorage
 */
NTPaypal.SessionStorage = function()
{	
    nettools.jscore.oop.parentConstructor(NTPaypal.SessionStorage, this);
}
nettools.jscore.oop.extend(NTPaypal.SessionStorage, NTPaypal.BrowserStorage);



/** 
 * Saving a value to storage
 *
 * @param string key
 * @param string value
 */
NTPaypal.SessionStorage.prototype.set = function(key, value){
	return window.sessionStorage.setItem(key, value);
}



/** 
 * Getting a value from storage
 *
 * @param string key
 * @return string
 */
NTPaypal.SessionStorage.prototype.get = function(key){
	return window.sessionStorage.getItem(key);
}



// ----------------------------------------------------------------------



/**
 * Class defining methods for storing / restoring data from browser cookies
 */
NTPaypal.CookiesStorage = function()
{	
    nettools.jscore.oop.parentConstructor(NTPaypal.CookiesStorage, this);
}
nettools.jscore.oop.extend(NTPaypal.CookiesStorage, NTPaypal.BrowserStorage);



/** 
 * Saving a value to storage
 *
 * @param string key
 * @param string value
 */
NTPaypal.CookiesStorage.prototype.set = function(key, value){
	return nettools.jscore.setCookie(key, value);
}



/** 
 * Getting a value from storage
 *
 * @param string key
 * @return string
 */
NTPaypal.CookiesStorage.prototype.get = function(key){
	return nettools.jscore.getCookie(key);
}



// ----------------------------------------------------------------------



/**
 * Constructor for a class implementing a store/restore mechanism so that a shopping cart can be saved between page reloads, browsing, etc.
 *
 * @param BrowserStorage browserIntf Constructor for a BrowserStorage child class, implementing getter/setter to store and read values in browser session (cookies, localStorage, sessionStorage) ; d
 * @param string shopname
 */
NTPaypal.Session = function(browserIntf, shopname){

	// browserIntf is a class reference (such as NTPaypal.LocalStorage) ; creating an object of that class and check inheritance
	this.storage = new browserIntf();	
	if ( !(this.storage instanceof NTPaypal.BrowserStorage) )
		throw new TypeError("'browserIntf' parameter of 'Session' object constructor is a constructor inheriting from 'BrowserStorage'")
	
	
	this.shopname = shopname || 'paypalshop';
}



/**
 * Save current cart to storage
 * 
 * @param Cart cart
 */
NTPaypal.Session.prototype.save = function(cart)
{
	// checking parameter
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Session.save' method is not an instance of 'Cart'");
	
	this.storage.set(this.shopname + '.cart', JSON.stringify(cart));
}



/**
 * Restore cart from storage
 * 
 * @return Cart
 * @throw Error Thrown if store quantities are not enough any more to supply the quantities in cart
 */
NTPaypal.Session.prototype.restore = function(store)
{
	// restoring carte from storage
	var json = this.storage.get(this.shopname + '.cart');
	if ( !json )
		return new NTPaypal.Cart([]);
	
		
	// if json data exists, read cart from storage
	var cart = NTPaypal.Cart.fromJson(json);	
		
	
	// if store set in parameter, adjusting store quantities with cart ; when we restore a cart from storage,
	// quantities from store must be decremented according to quantities in cart
	if ( store )
	{
		// checking parameter
		if ( !(store instanceof NTPaypal.Store) )
			throw new TypeError("'store' parameter of 'Session.restore' method is not an instance of 'Store'");

		
		var items = cart.getContent();		
		
		items.forEach(function(prd){
			var pstore = store.get(prd.product.sku);
			pstore.quantity -= prd.quantity;
			
			if ( pstore.quantity < 0 )
				throw new Error("Cart quantity for product with SKU '" + prd.product.sku + "' doesn't match any more quantity available in store");
		});
	}
		
	
	return cart;
}



/**
 * Test storage for a previously saved session
 * 
 * @return bool
 */
NTPaypal.Session.prototype.hasData = function()
{
	// restoring carte from storage
	return this.storage.get(this.shopname + '.cart') ? true : false;
}


