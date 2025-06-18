package repository

func CountItens(itemId int) (int64, error) {
	query := "SELECT count(*) FROM allocation WHERE status <> 'deleted' AND item_sku = $1"
	var count int64
	err := db.QueryRow(query, itemId).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
