package repository

func VeryfyCategory(categoryId int) bool {
	if categoryId == 0 {
		return false
	}
	err := db.QueryRow("SELECT id FROM category WHERE id = ?", categoryId)

	return err == nil
}
