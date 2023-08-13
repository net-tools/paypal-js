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
 * Check if a product SKU has already been added to the store
 *
 * @param string sku
 * @return bool
 */
NTPaypal.Store.prototype.contains = function(sku){
	
	return this.inventory.contains(sku);
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
NTPaypal.BrowserStorage = class 
{	
	/** 
	 * Abstract method for saving a value to storage
	 *
	 * @param string key
	 * @param string value
	 */
	set(key, value){
		throw new Error("'set' method not implemented in class '" + this.constructor.name + "'");
	}



	/** 
	 * Abstract method for getting a value from storage
	 *
	 * @param string key
	 * @return string
	 */
	get(key){
		throw new Error("'get' method not implemented in class '" + this.constructor.name + "'");
	}



	/** 
	 * Abstract method for deleting a value from storage
	 *
	 * @param string key
	 */
	delete(key){
		throw new Error("'delete' method not implemented in class '" + this.constructor.name + "'");
	}



	/** 
	 * Checking if a key exists in storage
	 *
	 * @param string key
	 * @return bool Returns true if key exists (with value other than null)
	 */
	test(key){
		return this.get(key) != null;
	}

}




// ----------------------------------------------------------------------



/**
 * Class defining methods for storing / restoring data from browser localStorage
 */
NTPaypal.LocalStorage = class NTPaypal_LocalStorage  extends NTPaypal.BrowserStorage
{
	/** 
	 * Saving a value to storage
	 *
	 * @param string key
	 * @param string value
	 */
	set(key, value){
		return window.localStorage.setItem(key, value);
	}



	/** 
	 * Getting a value from storage
	 *
	 * @param string key
	 * @return string
	 */
	get(key){
		return window.localStorage.getItem(key);
	}



	/** 
	 * Deleting a value from storage
	 *
	 * @param string key
	 */
	delete(key){
		return window.localStorage.removeItem(key);
	}
}




// ----------------------------------------------------------------------



/**
 * Class defining methods for storing / restoring data from browser sessionStorage
 */
NTPaypal.SessionStorage = class NTPaypal_SessionStorage extends NTPaypal.BrowserStorage {

	/** 
	 * Saving a value to storage
	 *
	 * @param string key
	 * @param string value
	 */
	set(key, value){
		return window.sessionStorage.setItem(key, value);
	}



	/** 
	 * Getting a value from storage
	 *
	 * @param string key
	 * @return string
	 */
	get(key){
		return window.sessionStorage.getItem(key);
	}



	/** 
	 * Deleting a value from storage
	 *
	 * @param string key
	 */
	delete(key){
		return window.sessionStorage.removeItem(key);
	}

}




// ----------------------------------------------------------------------



/**
 * Class defining methods for storing / restoring data from browser cookies
 */
NTPaypal.CookiesStorage = class NTPaypal_CookiesStorage extends NTPaypal.BrowserStorage{

	/** 
	 * Saving a value to storage
	 *
	 * @param string key
	 * @param string value
	 */
	set(key, value){
		return nettools.jscore.setCookie(key, value);
	}



	/** 
	 * Getting a value from storage
	 *
	 * @param string key
	 * @return string
	 */
	get(key){
		return nettools.jscore.getCookie(key);
	}



	/** 
	 * Deleting a value from storage
	 *
	 * @param string key
	 */
	delete(key){
		return nettools.jscore.deleteCookie(key);
	}

	
}



// ----------------------------------------------------------------------



/**
 * Constructor for a class implementing a store/restore mechanism so that a shopping cart can be saved between page reloads, browsing, etc.
 *
 * @param BrowserStorage browserIntf Constructor for a BrowserStorage child class, implementing getter/setter to store and read values in browser session (cookies, localStorage, sessionStorage) ; d
 * @param Shop shop
 * @param Cart cart
 * @param Store store Store object, may be null if it's not required to deal with quantities when loading cart from storage
 */
NTPaypal.Session = function(browserIntf, shop, cart, store){

	// browserIntf is a class reference (such as NTPaypal.LocalStorage) ; creating an object of that class and check inheritance
	this.storage = new browserIntf();	
	if ( !(this.storage instanceof NTPaypal.BrowserStorage) )
		throw new TypeError("'browserIntf' parameter of 'Session' object constructor is not a constructor inheriting from 'BrowserStorage'")
	
	if ( !(shop instanceof NTPaypal.Shop) )
		throw new TypeError("'shop' parameter of 'Session' constructor is not a Shop instance");
	
	if ( !(cart instanceof NTPaypal.Cart) )
		throw new TypeError("'cart' parameter of 'Session' constructor is not a Cart instance");

	if ( store && !(store instanceof NTPaypal.Store) )
		throw new TypeError("'store' parameter of 'Session' constructor is not a Store instance");
	
	
	this.cart = cart;
	this.store = store;
	this.shop = shop;
}



/**
 * Delete current cart from storage
 * 
 * @param Cart cart
 */
NTPaypal.Session.prototype.delete = function()
{
	this.storage.delete(this.shop.shopid + '.cart');
}



/**
 * Save current cart to storage
 */
NTPaypal.Session.prototype.save = function()
{
	this.storage.set(this.shop.shopid + '.cart', JSON.stringify(this.cart));
}



/**
 * Restore cart from storage
 *
 * When restoring a cart from storage, and when store content is freshly loaded, the store quantities are those in stock, but don't match quantities in cart.
 * We remind that only the cart is saved in the storage, not the store ; when adding a product from store to cart, the quantity in store is decremented, and the quantity
 * in cart incremented. When loading the cart from storage, we have to update store quantities to reproduce the same behavior : Total_quantity = store_quantity + cart_quantity
 * - To update the store (decrement its quantities) when loading the cart, set the 'store' parameter with a Store object
 * - To handle edge cases, use the storeIntf object (store quantity not enough for cart quantities, cart product not found in store)
 * 
 * @param SessionStoreInterface storeIntf Class to handle issues with store quantities when loading cart from storage (not mandatory)
 * @return Cart
 */
NTPaypal.Session.prototype.restore = function(storeIntf)
{
	// restoring carte from storage
	var json = this.storage.get(this.shop.shopid + '.cart');
	if ( !json )
		return this.cart = new NTPaypal.Cart([]);
	
		
	// if json data exists, read cart from storage
	this.cart = NTPaypal.Cart.fromJson(json);	
		
	
	// if store set in parameter, adjusting store quantities with cart ; when we restore a cart from storage,
	// quantities from store must be decremented according to quantities in cart
	if ( this.store )
	{
		// if no store interface, creating default one
		if ( !storeIntf )
			storeIntf = new NTPaypal.SessionStoreInterface();

		// checking parameter
		if ( !(storeIntf instanceof NTPaypal.SessionStoreInterface) )
			throw new TypeError("'storeIntf' parameter of 'Session.restore' method is not an instance of 'SessionStoreInterface'");
		
		
		
		var items = this.cart.getContent();		
		var err_toremove = [];
		var dirty = false;
		
		items.forEach(function(prd){
			
			// if store doesn't contain product anymore or quantity is null
			if ( !this.store.contains(prd.product.sku) || (this.store.get(prd.product.sku).quantity == 0) )
			{
				dirty = true;
				err_toremove.push(prd.product.sku);
				storeIntf.unavailable(prd.product);
			}
			else
			{
				// store contains product
				var pstore = this.store.get(prd.product.sku);
				

				// update quantities
				pstore.quantity -= prd.quantity;
				if ( pstore.quantity < 0 )
				{
					// cart.quantity > store.quantity
					prd.quantity = prd.quantity + pstore.quantity;
					pstore.quantity = 0;
					dirty = true;
					storeIntf.lowerQuantity(prd.product);
				}
			}
		}, this);
		
		
		// if some items must be removed from cart
		err_toremove.forEach(function(sku){
			this.cart.remove(sku);
		}, this);
		
		
		if ( dirty )
			this.save();
	}
		
	
	return this.cart;
}



/**
 * Test storage for a previously saved session
 * 
 * @return bool
 */
NTPaypal.Session.prototype.hasData = function()
{
	// restoring carte from storage
	return this.storage.get(this.shop.shopid + '.cart') ? true : false;
}



// ----------------------------------------------------------------------



/**
 * Class to handle issues with store when loading a cart from storage, and store quantities don't match those in the store anymore
 * 
 * @param function whenLowerQuantity Callback(Product product) to be called when quantity of a product in store is lower than the quantity in the cart
 * @param function whenUnavailable Callback(Product product) to be called when a product in the cart is not in the store
 */
NTPaypal.SessionStoreInterface = function(whenLowerQuantity, whenUnavailable)
{
	this.whenLowerQuantity = whenLowerQuantity;
	this.whenUnavailable = whenUnavailable;
}



/**
 * Method to handle lower quantity issues
 *
 * @param Product prd
 */
NTPaypal.SessionStoreInterface.prototype.lowerQuantity = function(product)
{
	if ( !(product instanceof NTPaypal.Product) )
		throw new TypeError("'product' parameter of 'SessionStoreInterface.lowerQuantity' method is not an instance of 'Product'");
	
	
	if ( typeof(this.whenLowerQuantity) != 'function' )
		alert("Product '"  + product.title + "' quantity updated to match lower quantity available in store");
	else
		this.whenLowerQuantity(product);
}



/**
 * Method to handle issue when product in not available any more
 *
 * @param Product prd
 */
NTPaypal.SessionStoreInterface.prototype.unavailable = function(product)
{
	if ( !(product instanceof NTPaypal.Product) )
		throw new TypeError("'product' parameter of 'SessionStoreInterface.unavailable' method is not an instance of 'Product'");
		
	
	if ( typeof(this.whenUnavailable) != 'function' )
		alert("Product '"  + product.title + "' is not currently available in store");
	else
		this.whenUnavailable(product);
}


