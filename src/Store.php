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
	 * @param Inventory $inventory
	 */
	public function __construct(Inventory $inventory)
	{
		$this->inventory = $inventory;
	}
	
}

?>