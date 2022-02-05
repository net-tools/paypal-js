<?php
/**
 * ProductQuantity
 *
 * @author Pierre - dev@nettools.ovh
 * @license MIT
 */


// namespace
namespace Nettools\PaypalJs;



/**
 * ProductQuantity class
 */
class ProductQuantity {
	
	public $quantity;
	public $product;
	
	
	
	/**
	 * Constructor
	 * 
	 * @param Product $product
	 * @param int $quantity
	 */
	public function __construct(Product $product, $quantity)
	{
		$this->product = $product;
		$this->quantity = $quantity;
	}
	
}

?>