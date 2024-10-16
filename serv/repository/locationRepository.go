package repository

import "stockpille/entity"

func InsertLocation(location entity.Location) {
	_, err := db.Exec(("INSERT INTO location (name) VALUES ($1)"),
		location.Name)

	if err != nil {
		panic(err)
	}
}

func GetAllLocations() []entity.Location {
	rows, err := db.Query("SELECT id, name FROM location")
	if err != nil {
		panic(err)
	}

	var locations []entity.Location
	for rows.Next() {
		var location entity.Location
		err = rows.Scan(&location.Id, &location.Name)
		if err != nil {
			panic(err)
		}
		locations = append(locations, location)
	}
	return locations
}
