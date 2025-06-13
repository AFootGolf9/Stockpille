package repository

import "time"

func GetUserIdByToken(token string) int {
	var id int
	var date time.Time
	err := db.QueryRow("SELECT user_id, time FROM token WHERE token = $1", token).Scan(&id, &date)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return -1
		}
		panic(err)
	}

	if time.Since(date).Hours() > 6 {
		db.Exec("DELETE FROM token WHERE token = $1", token)
		return -1
	}
	return id
}

func NewToken(token string, userId int) {
	db.Exec("DELETE FROM token WHERE user_id = $1", userId)
	_, err := db.Exec("INSERT INTO token (token, user_id) VALUES ($1, $2)", token, userId)

	if err != nil {
		panic(err)
	}
}

func deleteTokenFromUser(userId int) {
	_, err := db.Exec("DELETE FROM token WHERE user_id = $1", userId)

	if err != nil {
		panic(err)
	}
}
