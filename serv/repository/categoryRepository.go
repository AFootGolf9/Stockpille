package repository

func VeryfyCategory(categoryId int) bool {
	if categoryId == 0 {
		return false
	}
	row := db.QueryRow("SELECT id FROM category WHERE id = $1;", categoryId)

	return row.Err() == nil
}
