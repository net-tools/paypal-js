'use strict';



// checking client.js is known
if ( typeof NTPaypal != 'object' )
	throw new Error('client.js script is mandatory and a dependency of i18n.js');



/**
 * Class for translations
 */
NTPaypal.i18n = {
	
	// for ui.js
	ui : {
		SECTION1_CART : {
			product 	: 'Produit',
			quantity 	: 'Quantité',
			price 		: 'Prix unitaire', 
			total 		: 'Total',
			with_vat	: 'TTC',
			vat_amount	: 'dont TVA',
			btn_toShipping : 'Valider le panier et définir la livraison',
			stock_issue : "Impossible d'ajouter un autre exemplaire de ce produit dans le panier car le stock n'est pas suffisant"
		},
		
	
		SECTION2_SHIPPING : {
			firstname : 'Prénom',
			surname   : 'Nom',
			address1  : 'Adresse',
			address2  : 'Immeuble, étage, ...',
			zipcode	  : 'Code postal',
			city	  : 'Ville',
			country   : 'Pays',
			email	  : 'Email',
			phone	  : 'Téléphone',
			btn_backToCart : 'Modifier le panier',
			btn_toConfirm  : 'Vérifier la commande et payer',
			regexp_zipcode : nettools.jscore.validator.Patterns.CP.source,
			regexp_phone : nettools.jscore.validator.Patterns.TEL.source
		},
		
		
		SECTION3_CONFIRM : {
			carrier		: "Merci de choisir un transporteur parmi la liste suivante",
			shipping_nocarrier : "[--Choisir un transporteur--]",
			carrier_select : "Merci de choisir un transporteur avant de cliquer sur 'Payer maintenant'",
			shipping 	: "Pour une livraison à l'adresse ci-dessous, les frais de port sont de",
			intro 		: "Vous êtes sur le point de payer définitivement votre panier",
			total		: "pour un total (dont port) de",
			recipient	: "Votre commande sera expédiée à l'adresse suivante",
			agreement 	: "En cochant la case ci-contre et en cliquant sur \"Payer maintenant\" ci-dessous, vous reconnaissez accepter les Conditions Générales de Vente et vous vous engagez à payer les articles du panier",
			btn_backToCart : 'Modifier le panier',
			btn_backToShipping : 'Modifier la livraison',
			btn_pay		: 'Payer maintenant',
			tos_accept	: "Vous devez accepter les Conditions Générales de Vente avant de passer au paiement, en cliquant sur la case prévue à cet effet sous l'adresse de livraison",
			payment_error	: "Aucun paiement reçu, vous pouvez tenter à nouveau",
			payment_received : "Votre paiement a bien été reçu. Merci."
		}
		
	}
}