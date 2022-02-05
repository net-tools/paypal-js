<?php
/**
 * Store
 *
 * @author Pierre - dev@nettools.ovh
 * @license MIT
 */


// namespace
namespace Nettools\PaypalJs;



/**
 * Store class
 */
class Store {
	
	public $inventory;
	
	
	
	/**
	 * Constructor
	 * 
	 * @param ProductQuantity[] $items
	 */
	public function __construct(array $items)
	{
		$this->inventory = new Inventory($items);
	}
	
}

?>