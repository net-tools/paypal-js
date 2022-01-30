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
shop.expressBuy('product title', 10.50, 'PHYSICAL_GOODS', '#selector_here')
```
 
The `expressBuy` method expects a title, an amount, a category ('PHYSICAL_GOODS', 'DIGITAL_GOODS', 'DONATION') and a selector to 
draw the Paypal buttons into. Category parameters can be omitted (null) ; a Promise object is returned, and is resolved when the payment is done (otherwise, the promise is rejected).

See below for an example about how to use Promises. 
 
 

## How to use (complete process, with cart support)

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
shop.paypalButton(order, '#paypal_buttons_container');
```

The second parameter is a selector to identify the DOM tag that will hold the paypal buttons (usually, a DIV tag) ; replace `#paypal_buttons_container` with any relevant selector.
Upon completion of the method call, the Paypal buttons are rendered in the container, and the user can initiate the payment.



### Capturing data

The above Javascript line makes it possible for the client to do it's payment, however we have no callbacks yet to catch any relevant data (such as transaction ID) or send a "thanks" email.

The paypalButton returns a Promise, that when resolved will pass data about the transaction :

```
shop.paypalButton(order, '#paypal_buttons_container').then(
	function(data){
		alert('Transaction is OK, with ID ' + data.purchase_units[0].payments.captures[0].id);
	}
);
```






