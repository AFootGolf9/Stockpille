package entityRepository

import (
	"stockpille/entity"
	"strconv"
)

func SelectWithPagination(object entity.Entity, page int, size int) ([]entity.Entity, error) {
	query := "SELECT "
	camps := object.GetCamps()
	query += insertCampsS(object)
	query += " FROM " + camps[0]

	if object.IsPersisted() {
		query += " WHERE status <> 'deleted'"
	}

	query += " ORDER BY " + camps[1]

	query += " LIMIT " + strconv.Itoa(size) + " OFFSET " + strconv.Itoa(page*size)

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	objects := []entity.Entity{}
	for rows.Next() {
		object := object.New() // create a new object of the same type
		err = rows.Scan(object.GetData()...)
		if err != nil {
			return nil, err
		}
		objects = append(objects, object)
	}

	return objects, nil
}

func SelectWithPaginationAndUser(object entity.Entity, page int, size int, userId int) ([]entity.Entity, error) {
	query := "SELECT "
	camps := object.GetCamps()
	query += insertCampsS(object)
	query += " FROM " + camps[0] + " WHERE " + camps[len(camps)-1] + " = $1"

	if object.IsPersisted() {
		query += " AND status <> 'deleted'"
	}

	query += " ORDER BY " + camps[1]

	query += " LIMIT " + strconv.Itoa(size) + " OFFSET " + strconv.Itoa(page*size)

	rows, err := db.Query(query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	objects := []entity.Entity{}
	for rows.Next() {
		object := object.New() // create a new object of the same type
		err = rows.Scan(object.GetData()...)
		if err != nil {
			return nil, err
		}
		objects = append(objects, object)
	}

	return objects, nil
}
