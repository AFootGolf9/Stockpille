package repository

func GetItemQuantity(num int) int {
	var out int
	db.QueryRow("SELECT count(item_sku) FROM allocation WHERE item_sku = $1", num).Scan(&out)
	return out
}

func RelAllocByUser() map[string]int {
	// rows, err := db.Query("SELECT u.name, count(a.user_id) FROM user_data u " +
	// 	"INNER JOIN allocation a ON u.id = a.user_id where a.status <> 'deleted' " +
	// 	"GROUP BY u.id ORDER BY count(a.user_id) DESC;")

	rows, err := db.Query("SELECT u.name, count(a.user_id) FROM user_data u " +
		"INNER JOIN allocation a ON u.id = a.user_id " +
		"GROUP BY u.id ORDER BY count(a.user_id) DESC;")

	if err != nil {
		panic(err)
	}
	defer rows.Close()
	out := make(map[string]int)
	for rows.Next() {
		var name string
		var count int
		rows.Scan(&name, &count)
		out[name] = count
	}
	return out
}

func RelAllocByItem() map[string]int {
	// select i.name, count(a.item_sku) from item i inner join allocation a on i.sku = a.item_sku group by i.sku;

	rows, err := db.Query("SELECT i.name, count(a.item_sku) FROM item i " +
		"INNER JOIN allocation a ON i.sku = a.item_sku where a.status <> 'deleted' GROUP BY i.sku;")
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	out := make(map[string]int)
	for rows.Next() {
		var name string
		var count int
		rows.Scan(&name, &count)
		out[name] = count
	}
	return out
}

func RelItemByLocation() map[string]int {
	// select l.name, count(a.location_id) from location l inner join allocation a on l.id = a.location_id group by l.id;

	rows, err := db.Query("SELECT l.name, count(a.location_id) FROM location l" +
		" INNER JOIN allocation a ON l.id = a.location_id where a.status <> 'deleted' GROUP BY l.id;")
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	out := make(map[string]int)
	for rows.Next() {
		var name string
		var count int
		rows.Scan(&name, &count)
		out[name] = count
	}
	return out
}
