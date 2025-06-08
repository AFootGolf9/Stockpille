package entityRepository

import (
	"errors"
	"stockpille/entity"
	"strconv"
)

func SelfSelectPK(object entity.Entity, userId int) error {
	camps := object.GetCamps()
	query := "SELECT "

	query += insertCampsS(object)
	query += " FROM " + camps[0] + " WHERE " + camps[1] + " = $1 AND " + camps[len(camps)-1] + " = $2"

	err := db.QueryRow(query, object.GetId(), userId).Scan(object.GetData()...)
	if err != nil {
		return err
	}
	return nil
}

func SelfUpdate(object entity.Entity, userId int) error {
	if object.GetId() == 0 {
		return errors.New("ID NOT SET")
	}

	original := object.New()
	original.SetId(object.GetId())
	err := SelfSelectPK(original, userId)
	if err != nil {
		return err
	}

	for index, value := range object.GetData() {
		if value == nil {
			println("value is nil")
			object.GetData()[index] = original.GetData()[index]
		}
	}

	query := "UPDAATE"
	camps := object.GetCamps()
	query += camps[0] + " SET "
	for i := 2; i < len(camps); i++ {
		query += camps[i] + " = $" + strconv.Itoa(i-1)
		if i < len(camps)-1 {
			query += ", "
		}
	}

	query += " WHERE " + camps[1] + " = $" + strconv.Itoa(len(camps)-1) + " AND " + camps[len(camps)-1] + " = $" + strconv.Itoa(len(camps))

	list := append(object.GetData()[1:], object.GetId(), userId)

	_, err = db.Exec(query, list...)

	return err
}

func SelfDelete(object entity.Entity, userId int) error {
	var err error
	var query string
	if object.IsPersisted() {
		query = "UPDATE "
		camps := object.GetCamps()
		query += camps[0] + " SET status = 'deleted' WHERE " + camps[1] + " = $1 AND " + camps[len(camps)-1] + " = $2"
	} else {
		if object.GetId() == 0 {
			return errors.New("ID NOT SET")
		}

		query = "DELETE FROM "
		camps := object.GetCamps()
		query += camps[0] + " WHERE " + camps[1] + " = $1 AND " + camps[len(camps)-1] + " = $2"
	}
	_, err = db.Exec(query, object.GetId(), userId)

	return err
}
