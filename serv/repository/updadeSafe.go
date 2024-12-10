package repository

func PrepareForUpdate(camps []string, data []any) error {
	// original := object.New()
	// original.SetId(object.GetId())
	// err := SelectPK(original)
	// if err != nil {
	// 	return err
	// }

	// for index, value := range object.GetData() {
	// 	if value == nil {
	// 		println("value is nil")
	// 		object.GetData()[index] = original.GetData()[index]
	// 	}
	// }

	query := "SELECT "

	for i := 1; i < len(camps); i++ {
		query += camps[i]
		if i != len(camps)-1 {
			query += ", "
		}
	}

	query += " FROM " + camps[0] + " WHERE " + camps[1] + " = $1"

	// println(query)

	row := db.QueryRow(query, data[0])
	err := row.Scan(data...)

	return err
}
