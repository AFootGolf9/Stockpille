package repository

func GetItemQuantity(num int) int {
	var out int
	db.QueryRow("SELECT count(item_sku) FROM allocation WHERE item_sku = $1", num).Scan(&out)
	return out
}
