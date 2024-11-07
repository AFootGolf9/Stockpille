package main

import (
	"stockpille/controller"
	"stockpille/db"
	"stockpille/entity"
	"stockpille/repository"
	"stockpille/repository/entityRepository"
	"stockpille/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	database, err := db.Connect()
	if err != nil {
		panic(err)
	}
	entityRepository.SetDB(database)
	repository.SetDB(database)

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	rs := routes.RouteSeter{Router: r}

	rs.SetCRUD(&entity.User{})
	rs.SetCRUD(&entity.Item{})
	rs.SetCRUD(&entity.Location{})
	rs.SetCRUD(&entity.Allocation{})

	r.GET("/user/validate", controller.ValidateToken)
	r.POST("/user/login", controller.Login)

	r.Run() // listen and serve on
}
