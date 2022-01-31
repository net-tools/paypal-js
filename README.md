# net-tools/paypal-js
Client-side JS library to manage a simple e-shop with shopping cart and Paypal


## Setup instructions

To install net-tools/paypal-js package, just require it through composer and insert a script tag in the `HEAD` section :
```
<script src="/path_to_vendor/net-tools/paypal-js/src/client.js"></script>
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

Then, we begin with fluent API, starting with `sell` method. It accepts a CartItem object (or array of objects) to represent the items purchased.
The CartItem may be created in a programmatic way or rather with the fluent API provided with `Shop.product` method (having title, quantity, cost and category parameters)

```
shop.sell(shop.product('Product Label', 10, 3.45, 'PHYSICAL_GOODS'))
```

Then, we use CartItem fluent methods if needed :
 
```
shop.sell(
		shop.product('Product Label', 10, 3.45, 'PHYSICAL_GOODS')
				.setTax(12)
				.withDescription('Fantastic product here')
				.setSku('EANXXXXXXX')
	)
```

The `sell` method returns a Sale object providing several fluent methods (`to`, `withShipping`, `withDescription`, `withCustom_id`) making it possible to
chain calls to specify customer, shipping cost, description and client-side id.

```
shop.sell(
		shop.product('Product Label', 10, 3.45, 'PHYSICAL_GOODS')
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
			.withCustom_id('Invoice nABC123')
			.withPhone('0601020304', 'MOBILE')
	)
```
 
Here, the Sale object is ready ; please not that all fluent API calls expect `sell` and its parameter are not mandatory.
To prepare the Paypal buttons rendering, we call the `payButtonsInside` method (with target selector in DOM tree), which prepares a Payment object, on which we
call its `execute` method to display buttons.

```
shop.sell(
		shop.product('Product Label', 10, 3.45, 'PHYSICAL_GOODS')
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
		shop.product('Product Label', 10, 3.45, 'PHYSICAL_GOODS')
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

Then we create the Customer and CartItem objects. Please not that mandatory values are passed as regular parameters to constructors, whereas 
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

var p1 = shop.newItem('Product 1', 1, 12.50, 'PHYSICAL_GOODS', {
		sku : 'EAN123456',
 		tax : 1.12, 
		description : 'Great product 1 here'
	});
```

We create a shopping cart filled with the items (here, only one)

```
var cart = shop.newCart([p1]);
```

Finally, we create the order binding all thoses objects together 

```
var order = shop.newOrder(cart, cust);
```

Up to now, there's no Paypal button displayed yet. We can still update the shopping cart, with relevant Cart objects methods (`add`, `remove`, `setQuantity`, `search`, `contains`, `count`, `empty`).

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






