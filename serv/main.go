package main

import (
	"stockpille/controlller"
	"stockpille/db"
	"stockpille/repository"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	database, err := db.Connect()
	if err != nil {
		panic(err)
	}
	repository.SetDB(database)

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	r.GET("/user/validate", controlller.ValidateToken)
	r.GET("/user/", controlller.GetAllUsers)
	r.GET("/item/", controlller.GetAllItems)
	r.GET("/location/", controlller.GetAllLocations)
	r.POST("/user/", controlller.NewUser)
	r.POST("/user/login", controlller.Login)
	r.POST("/item/", controlller.NewItem)
	r.POST("/location/", controlller.NewLocation)
	r.GET("/user/:id", controlller.GetUserById)
	r.PUT("/user/:id", controlller.UpdateUser)
	r.DELETE("/user/:id", controlller.DeleteUser)

	r.Run() // listen and serve on
}
