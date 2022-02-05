<?php
/**
 * Inventory
 *
 * @author Pierre - dev@nettools.ovh
 * @license MIT
 */


// namespace
namespace Nettools\PaypalJs;



/**
 * Inventory class
 */
class Inventory {
	
	public $items;
	
	
	
	/**
	 * Constructor
	 * 
	 * @param ProductQuantity[] $items
	 */
	public function __construct(array $items)
	{
		$this->items = $items;			 
	}
	
}

?>