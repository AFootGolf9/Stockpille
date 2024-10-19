package repository

import (
	"database/sql"
	"errors"
	"stockpille/entity"
	"strconv"
)

var db *sql.DB

func SetDB(database *sql.DB) {
	db = database
}

func Insert(object entity.Entity) error {
	query := "INSERT INTO "
	camps := object.GetCamps()
	query += camps[0] + " ("
	for i := 2; i < len(camps); i++ {
		query += camps[i]
		if i != len(camps)-1 {
			query += ", "
		}
	}
	query += ") VALUES ("
	for i := 2; i < len(camps); i++ {
		query += "$" + strconv.Itoa(i-1)
		if i != len(camps)-1 {
			query += ", "
		}
	}
	query += ")"
	_, err := db.Exec(query, object.GetData()[1:]...)

	return err
}

func SelectPK(object entity.Entity) error {
	query := "SELECT "
	camps := object.GetCamps()
	for i := 1; i < len(camps); i++ {
		query += camps[i]
		if i != len(camps)-1 {
			query += ", "
		}
	}
	query += " FROM " + camps[0] + " WHERE " + camps[1] + " = $1"
	row := db.QueryRow(query, object.GetId())
	err := row.Scan(object.GetData()...)

	return err
}

func SelectAll(object entity.Entity) ([]entity.Entity, error) {
	query := "SELECT "
	camps := object.GetCamps()
	for i := 1; i < len(camps); i++ {
		query += camps[i]
		if i != len(camps)-1 {
			query += ", "
		}
	}
	query += " FROM " + camps[0]
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

func Update(object entity.Entity) error {
	if object.GetId() == 0 {
		return errors.New("Id not set")
	}

	original := object.New()
	original.SetId(object.GetId())
	err := SelectPK(original)
	if err != nil {
		return err
	}

	for index, value := range object.GetData() {
		if value == nil {
			object.GetData()[index] = original.GetData()[index]
		}
	}

	query := "UPDATE "
	camps := object.GetCamps()
	query += camps[0] + " SET "
	for i := 2; i < len(camps); i++ {
		query += camps[i] + " = $" + strconv.Itoa(i-1)
		if i != len(camps)-1 {
			query += ", "
		}
	}
	query += " WHERE " + camps[1] + " = $" + strconv.Itoa(len(camps)-1)

	list := append(object.GetData()[1:], object.GetId())

	print(query)
	_, err = db.Exec(query, list...)

	return err
}

func Delete(object entity.Entity) error {
	if object.GetId() == 0 {
		return errors.New("Id not set")
	}

	query := "DELETE FROM "
	camps := object.GetCamps()
	query += camps[0] + " WHERE " + camps[1] + " = $1"
	_, err := db.Exec(query, object.GetId())

	return err
}
