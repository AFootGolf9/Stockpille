package repository

import (
	"database/sql"
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
