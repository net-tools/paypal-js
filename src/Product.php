<?php
/**
 * Product
 *
 * @author Pierre - dev@nettools.ovh
 * @license MIT
 */


// namespace
namespace Nettools\PaypalJs;



/**
 * Product class
 */
class Product {
	
	public $title;
	public $price;
	public $category;
	public $tax;
	public $description;
	public $sku;
	public $currency_code;
	
	
	
	/**
	 * Constructor
	 * 
	 * @param string $title
	 * @param float $price
	 * @param string $category
	 * @param string $currency_code
	 * @param array $other Associative array of non-mandatory parameters (sku, tax, description)
	 */
	public function __construct($title, $price, $category, $currency_code, array $other = [])
	{
		$this->title = $title;
		$this->price = $price;
		$this->category = $category;
		$this->currency_code = $currency_code;
		
		$this->tax = $other['tax']?$other['tax']:0;
		$this->sku = $other['sku']?$other['sku']:'';
		$this->description = $other['description']?$other['description']:'';
	}
	
}

?>