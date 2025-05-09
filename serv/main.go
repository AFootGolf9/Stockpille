package main

import (
	"stockpille/controller"
	"stockpille/db"
	"stockpille/entity"
	"stockpille/middleware"
	"stockpille/repository"
	"stockpille/repository/entityRepository"
	"stockpille/routes"
	"stockpille/service"

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

	service.Start()

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	r.Use(middleware.AuthMiddleware())

	rs := routes.RouteSeter{Router: r}

	rs.SetCRUD(&entity.User{})
	rs.SetCRUD(&entity.Item{})
	rs.SetCRUD(&entity.Location{})
	rs.SetCRUD(&entity.Allocation{})
	rs.SetCRUD(&entity.Role{})

	r.GET("/item/quantity/:id", controller.GetItemQuantity)
	r.GET("/user/validate", controller.ValidateToken)
	r.POST("/user/login", controller.Login)

	r.GET("/rel/allocbyuser", controller.RelAllocByUser)
	r.GET("/rel/allocbyitem", controller.RelAllocByItem)
	r.GET("/rel/itembylocation", controller.RelItemByLocation)

	r.POST("/test", controller.CreatePermission)

	// https://github.com/gin-gonic/gin/blob/v1.10.0/docs/doc.md#custom-middleware

	r.Run() // listen and serve on
}
