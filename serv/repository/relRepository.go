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

func RelItemByCategory() map[string]int {
	// select c.name, count(i.category_id) from category c inner join item i on c.id = i.category_id group by c.id;

	rows, err := db.Query("SELECT c.name, count(i.category_id) FROM category c " +
		"INNER JOIN item i ON c.id = i.category_id WHERE i.status <> 'deleted' and c.status <> 'deleted' GROUP BY c.id;")
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

func RelUserByRole() map[string]int {
	// select r.name, count(u.role_id) from role r inner join user_data u on r.id = u.role_id group by r.id;

	rows, err := db.Query("SELECT r.name, count(u.roleid) FROM role r " +
		"INNER JOIN user_data u ON r.id = u.roleid WHERE u.status <> 'deleted' and r.status <> 'deleted' GROUP BY r.id;")
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
