# net-tools/paypal-js
Client-side JS library to manage a simple e-shop with shopping cart and Paypal


## Setup instructions

To install net-tools/paypal-js package, just require it through composer and insert a script tag in the `HEAD` section :

```
<script src="/path_to_vendor/net-tools/paypal-js/src/js/client.js"></script>
```

Please not net-tools/js-core is also required :

```
<script src="/path_to_vendor/net-tools/js-core/src/js-core.js.min"></script>
```


## How to use (simple process)
 
If no cart handling is required, and customer data is not needed, the script is rather simple :

```
var shop = new NTPaypal.Shop('EUR');
shop.expressButtons('product title', 10.50, 'PHYSICAL_GOODS', '#selector_here')
```
 
The `expressButtons` method expects a title, an amount, a category ('PHYSICAL_GOODS', 'DIGITAL_GOODS', 'DONATION') and a selector to 
draw the Paypal buttons into. Category parameters can be omitted (null) ; a Promise object is returned, and is resolved when the payment is 
done (otherwise, the promise is rejected).

See below for an example about how to use Promises. 






## How to use (complete process, with cart support and fluent API)

For more complex situations, such as buying several products, dealing with shipping cost, etc. we have to deal with other objects.
A way to do that is to use the programmatic API (see next chapter below), through creating Customer, Cart and Order objects before 
calling the `paypalButtons` method to initiate the payment.

Another way to create the required data is to use the fluent API provided


### Setting up Paypal script

First, the Paypal library must be included in a script tag (replace XXXXXX with your paypal client-ID) :
```
<script src="https://www.paypal.com/sdk/js?currency=EUR&client-id=XXXXXX"></script>
```

### Use fluent API

First, we create a Shop object with desired currency ; the Shop object which serves as a factory to build other required objects :

```
var shop = new NTPaypal.Shop('EUR');
```

Then, we begin with fluent API, starting with `sell` method. It accepts a Product object to represent a single item purchased. If
purchasing different products, with maybe some quantities for each one, the `sell` method can accept an array of ProductQuantity objects (associating Product and quantity).
The Product object may be created in a programmatic way or rather with the fluent API provided with `Shop.product` method (having title, cost and category parameters)

```
shop.sell(shop.product('Product Label', 3.45, 'PHYSICAL_GOODS'))
```

Then, we use Product fluent methods if needed :
 
```
shop.sell(
		shop.product('Product Label', 3.45, 'PHYSICAL_GOODS')
				.setTax(12)
				.withDescription('Fantastic product here')
				.setSku('EANXXXXXXX')
	)
```

To set an amount of units for a product, we use the fluent method `setQuantity` on the Product object returned by `Shop.product`. However, it's important to note that
`setQuantity` does not return the Product object, but a new object of class ProductQuantity, thus preventing further chaining. In other words, 
`setTax`, `withDescription` and `setSku` must be called before :

```
shop.sell(
		shop.product('Product Label', 3.45, 'PHYSICAL_GOODS')
				.setTax(12)
				.withDescription('Fantastic product here')
				.setSku('EANXXXXXXX')
				.setQuantity(3)
	)
```

The `sell` method returns a Sale object providing several fluent methods (`to`, `withShipping`, `withDescription`, `withCustom_id`) making it possible to
chain calls to specify customer, shipping cost, description and client-side id.

```
shop.sell(
		shop.product('Product Label', 3.45, 'PHYSICAL_GOODS')
				.setTax(12)
				.withDescription('Fantastic product here')
				.setSku('EANXXXXXXX')
	)	
	.withShipping(32)
	.withDescription('Order received, thanks')
	.withCustom_id('Invoice nABC123')
	.to(
		shop.customer()
			.named('John', 'Doe'),
			.living('123, fifth Avenue')
			.in('75000', 'PARIS', 'FR')
			.withEmail('john.doe@gmail.com')
			.withPhone('0601020304', 'MOBILE')
	)
```
 
Here, the Sale object is ready ; please not that all fluent API calls expect `sell` and its parameter are not mandatory.
To prepare the Paypal buttons rendering, we call the `payButtonsInside` method (with target selector in DOM tree), which prepares a Payment object, on which we
call its `execute` method to display buttons.

```
shop.sell(
		shop.product('Product Label', 3.45, 'PHYSICAL_GOODS')
				.setTax(12)
				.withDescription('Fantastic product here')
				.setSku('EANXXXXXXX')
	)	
	.withShipping(32)
	.withDescription('Order received, thanks')
	.to(
		shop.customer()
			.named('John', 'Doe'),
			.living('123, fifth Avenue')
			.in('75000', 'PARIS', 'FR')
			.withEmail('john.doe@gmail.com')
			.withPhone('0601020304', 'MOBILE')
	)
	.payButtonsInside('#div_paypal_here')
	.execute();
```
 
If some Paypal application context parameters are required, they can be set thanks to the Payment object which defines `set` and `withApplicationContext` methods :

```
shop.sell(
		shop.product('Product Label', 3.45, 'PHYSICAL_GOODS')
				.setTax(12)
				.withDescription('Fantastic product here')
				.setSku('EANXXXXXXX')
	)	
	.withShipping(32)
	.withDescription('Order received, thanks')
	.to(
		shop.customer()
			.named('John', 'Doe'),
			.living('123, fifth Avenue')
			.in('75000', 'PARIS', 'FR')
			.withEmail('john.doe@gmail.com')
			.withPhone('0601020304', 'MOBILE')
	)
	.payButtonsInside('#div_paypal_here')
	.set('shipping_preference', 'NO_SHIPPING')
	.execute();
```

The `sell` method returns a Promise which is resolved when the payment is done. 
 
 
 

## How to use (complete process, with cart support, programmatic API)

This library defines several Javasript objects to manage products, customer details, shopping cart, order and makes it possible to launch a Paypal payment window.

### Setting up Paypal script

First, the Paypal library must be included in a script tag (replace XXXXXX with your paypal client-ID) :
```
<script src="https://www.paypal.com/sdk/js?currency=EUR&client-id=XXXXXX"></script>
```

If desired, the Paypal library loading can be differed until displaying the Paypal "buy" buttons (see below).


### Create objects 

First, we create a Shop object with desired currency ; the Shop object which serves as a factory to build other required objects :

```
var shop = new NTPaypal.Shop('EUR');
```

Then we create the Customer and Product objects. Please not that mandatory values are passed as regular parameters to constructors, whereas 
not required ones are passed through an `other` object litteral parameter.

```					
var cust = shop.newCustomer('John', {
	surname : 'doe',
	address1 : '1 Kensington Avenue', 
	address2 : 'Building B', 
	zipcode : '75000', 
	city : 'PARIS', 
	countrycode : 'FR'
	email : 'john.doe@gmail.com', 
	phone : '0601020304',
	phone_type : 'MOBILE'
});

var p1 = shop.newProduct('Product 1', 12.50, 'PHYSICAL_GOODS', {
		sku : 'EAN123456',
 		tax : 1.12, 
		description : 'Great product 1 here'
	});
```

We create a shopping cart filled with the items (here, a product with an amount of 5 units) and proper quantities.

```
var cart = shop.newCart([shop.newProductQuantity(p1, 5)]);
```

Finally, we create the order binding all thoses objects together 

```
var order = shop.newOrder(cart, cust);
```

Up to now, there's no Paypal button displayed yet. We can still update the shopping cart, with relevant Cart objects methods (`add`, `remove`, `setQuantity`, `contains`, `count`, `empty`).

Then, to show the Paypal "buy now" buttons, we call the appropriate function from Shop object :

```
shop.paypalButtons(order, '#paypal_buttons_container');
```

The second parameter is a selector to identify the DOM tag that will hold the paypal buttons (usually, a DIV tag) ; replace `#paypal_buttons_container` with any relevant selector.
Upon completion of the method call, the Paypal buttons are rendered in the container, and the user can initiate the payment.

There's also a third parameter, which makes it possible to pass the `application_context` parameter to the Paypal API. Mainly, this is used 
to set it with `{ shipping_preference : 'NO_SHIPPING' }`, thus removing some customer address text fields not needed (only when clicking on 'Pay by card' black button).



### Capturing data

The above Javascript line makes it possible for the client to do it's payment, however we have no callbacks yet to catch any relevant data (such as transaction ID) or send a "thanks" email.

The paypalButton returns a Promise, that when resolved will pass data about the transaction :

```
shop.paypalButtons(order, '#paypal_buttons_container').then(
	function(data){
		alert('Transaction is OK, with ID ' + data.purchase_units[0].payments.captures[0].id);
	}
);
```



## Saving/restoring cart and cart items to browser storage

Since the user may browse several pages to create his order, putting several products in the shopping cart, it's required to save the current cart content between 
page loads, reloads etc.

The NTPaypal client library provides 3 storage strategies : cookies (cart content lost when browser is closed), localStorage (cart content never lost), 
sessionStorage (cart content lost when page, not browser is closed).

To save the cart content to browser storage, a Session object must be created with appropriate parameters ; then the `save` method is called. To restore data, `restore` method should be called.

```
// creating session
// save/restore will be done through CookiesStorage interface (please note that you mustn't create a CookiesStorage object with new keyword, just pass the constructor reference)
// create new Session object, with storage interface constructor, shop/cart/store objects
var s = new NTPaypal.Session(NTPaypal.CookiesStorage, shop, cart);

// saving a previously created Cart object
s.save();

// ...... some time later
var cart = s.restore();

```



## Managing store (stock) and cart

### Loading script

Store-related functions are in a separate javascript file : 

```
<script src="/path_to_vendor/net-tools/paypal-js/src/js/store.js"></script>
```


### Creating store

For a simple payment flow, creating a cart from scratch (like the example above) is enough.
However, when creating an online shop, it's mandatory to deal with product stock ; it prevents user from putting in the shopping cart more units of a product than those
available in the store.

Creating a Store object, with products and their quantities, is much like creating a Cart :

```
// creating 2 products with respectively 20 and 10 units
var p1 = new NTPaypal.ProductQuantity(new NTPaypal.Product('store_product_1', 11.11, 'PHYSICAL_GOODS', 'EUR', { sku : 'prd_1' }), 20);
var p2 = new NTPaypal.ProductQuantity(new NTPaypal.Product('store_product_2', 22.22, 'PHYSICAL_GOODS', 'EUR', { sku : 'prd_2' }), 10);
		
var store = new NTPaypal.Store([p1, p2]);
```

Since the quantities of each products may come from server-side database, creating the javascript Store object may be done with Json data :

```
var store = NTPaypal.Store.fromJson('{
   "inventory": {
      "items": [
         {
            "product": {
               "title": "store_product_1",
               "price": 11.11,
               "category": "PHYSICAL_GOODS",
               "tax": 0,
               "withDescription": "",
               "sku": "prd_1",
               "currency_code": "EUR"
            },
            "quantity": 20
         },
         {
            "product": {
               "title": "store_product_2",
               "price": 22.22,
               "category": "PHYSICAL_GOODS",
               "tax": 0,
               "withDescription": "",
               "sku": "prd_2",
               "currency_code": "EUR"
            },
            "quantity": 10
         }
      ]
   }
}');
```


### Adding items to cart

To move items from a Store object to a previously created Cart object :

```
store.addToCart('prd_1', cart);
```

If the product with given SKU doesn't exist, an Error exception is thrown.
If there's no more unit available in store, we can't move one to cart, the method `addToCart` return false.



### Moving back items from cart to store

To remove all units of a product in the cart and put them back to store :

```
store.removeFromCart('prd_1', cart);
```


### Dealing with quantities in cart

To update quantities of a product in the cart, there are 2 methods : one to set the amount, the other to add / remove units from current quantity in cart.

```
// set the amount to 5
store.setCartQuantity('prd_1', 5, cart);

// set the amount to the current amount in the cart minus 1
store.updateCartQuantity('prd_2', -1, cart);
```


### Loading cart from storage with stock management

If managing store quantities, store must be updated when loading a cart from storage, so that available quantities in store match total quantities minus quantities in cart.

To do so, Session object must be created with a Store object parameter, and a SessionStoreInterface object implementing callbacks to deal with specific cases must be passed to restore method.

```
// creating session
var s = new NTPaypal.Session(NTPaypal.CookiesStorage, shop, cart, store);

// ...... some time later
var cart = s.restore(new NTPaypal.SessionStoreInterface(
		function(product)
		{
			// deal with lower quantity available issues
		},
		
		function(product)
		{
			// deal with product unavailable issues
		}
	));

```


## Using UI

### Basic knowledge 

A Javascript simple cart/shipping/confirm UI is provided. It makes it possible, in 3 consecutive screens, to :
- show cart content (increment/decrement quantities of items already in cart)
- ask for shipping details
- prompt user for carrier selection (not mandatory), require Terms of Sales agreement and show Paypal buttons

Default UI language is English, but translations can be easily implemented (see provided French translations in `i18n-fr.js` file).

Although the UI script is quite big (in separate `ui.js` file), the use is rather simple, with few mandatory parameters.

```
var ui = new NTPaypal.UI("#container", session, {
		
	// get a list of countries available for user shipping ; returns an array of object litterals (country, code, isDefault)
	onCountries : function(cart, customer){
		return [ {country:'USA', code:'US', isDefault:true}, {country:'United Kingdom', code:'GB'} ];
	},


	// do some stuff when payment done
	onPaymentReceived : function(cart, customer, paypalData){
		alert("Payment done with paypal transaction id " + paypalData.purchase_units[0].payments.captures[0].id);
	},
	
	
	// do some stuff after 'payment done' called, during process cleaning
	onPaymentCompleted : function()
	{
		alert('Thanks you, now redirecting you to home page');
		document.location = '/';
	},


	// return a float with shipping cost for cart/customer
	onShippingCost : function(cart, customer){
		return 12.32;
	},


	// return a custom message displayed above buttons
	onCustomMessage : function(cart, customer){
		return "This is a custom message";
	},
	
	
	// display a link to Terms of Sales (not mandatory)
	TOSLink : { url : 'https://XXXXXXX', title:'Terms Of Sales : click here' }
});


ui.show();
```


### Advanced use : asking user choice for carriers

With the above example, the `onShippingCost` callback returns a float with a defined shipping cost (may be 0) ; we can ask the user to choose
its carrier. A carrier is defined by a name, a cost, a shipping_time, an image ; last 2 parameters are not mandatory.

```
// returning an array of carriers, ie object litterals (carrier, cost, shipping_time, image)
onShippingCost : function(cart, customer){
	return [ {carrier:"DHL", cost:24.50, shipping_time:"2 days"}, {carrier:"UPS", cost:20.89, shipping_time:"1 day"} ];
},
```

With the above code, the user will choose the carrier through a list box.

If preferred, the user can choose the carrier by clicking on radio buttons linked to carrier icons :

```
// returning an array of carriers, ie object litterals (carrier, cost, shipping_time, image)
onShippingCost : function(cart, customer){
	return [ {carrier:"DHL", cost:24.50, image:"url"}, {carrier:"UPS", cost:20.89, image:"data:image/png;base64,xxxxxxx"} ];
},
```
To replace the list box with radio buttons and images, we add a property `image` (may link to an URL or can be a base64 encoded data string).

Some base64-encoded images are provided inside the `carriers.json` file ; it's advised to copy/paste the required images inside your code, there's no
point including that big file with multiple carriers icons whereas you may only need one or two icons.



### Advanced use : implement asynchronous onPaymentReceived handler

In the above example, `onPaymentReceived` handler is called, executed, and upon its completion, control returns to ui.js script, that will chain on 
cart and session cleaning.

If some asynchronous tasks must be done client side inside `onPaymentReceived`, cleaning cart and session before completion of this async task may be wrong.

In that case, `onPaymentReceived` must return a Promise that will be resolved when the ui.js can chain on cleaning (in other words, when client-side task is completed).
For example, if calling some server-side script with Fetch API inside `onPaymentReceived`, we may call the `resolve` method of Promise construction as the
`then` argument when chaining on fetch() :

```
onPaymentReceived : function(cart, customer, paypal){
		return new Promise(function(resolve, reject){
			console.log(paypal); alert('Payment done, calling server-side script with Fetch API !');

			fetch('/path/to/script.php', {paypal_id : paypal.purchase_units[0].payments.captures[0].id})
				.then(resolve)
				.catch(reject);
		});
	},
```



