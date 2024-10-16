package repository

import "stockpille/entity"

func InsertItem(item entity.Item) {
	_, err := db.Exec(("INSERT INTO item (name, description) VALUES ($1, $2)"),
		item.Name, item.Description)

	if err != nil {
		panic(err)
	}
}

func GetAllItems() []entity.Item {
	rows, err := db.Query("SELECT sku, name, description FROM item")
	if err != nil {
		panic(err)
	}

	var items []entity.Item
	for rows.Next() {
		var item entity.Item
		err = rows.Scan(&item.Sku, &item.Name, &item.Description)
		if err != nil {
			panic(err)
		}
		items = append(items, item)
	}
	return items
}

func GetItemBySku(sku string) *entity.Item {
	row := db.QueryRow("SELECT * FROM item WHERE sku = $1", sku)

	var item entity.Item
	err := row.Scan(&item.Sku, &item.Name, &item.Description)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return nil
		}
		panic(err)
	}
	return &item
}
