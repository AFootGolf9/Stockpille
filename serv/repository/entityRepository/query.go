package entityRepository

import "stockpille/entity"

func Query(object entity.Entity, camp int, value string) ([]entity.Entity, error) {
	query := "SELECT "
	camps := object.GetCamps()
	for i := 1; i < len(camps); i++ {
		query += camps[i]
		if i != len(camps)-1 {
			query += ", "
		}
	}
	query += " FROM " + camps[0] + " WHERE " + camps[camp] + " = $1"
	rows, err := db.Query(query, value)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	objects := []entity.Entity{}
	for rows.Next() {
		object = object.New()
		err := rows.Scan(object.GetData()...)
		if err != nil {
			return nil, err
		}
		objects = append(objects, object)
	}

	return objects, nil
}
