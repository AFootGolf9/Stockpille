package main

import (
	"io"
	"os"
	"stockpille/controller"
	"stockpille/db"
	"stockpille/entity"
	"stockpille/middleware"
	"stockpille/repository"
	"stockpille/repository/entityRepository"
	"stockpille/routes"
	"stockpille/service"
	"time"

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

	gin.DisableConsoleColor()

	os.Mkdir("logs", os.ModePerm)

	// log file with timestamp

	path := "logs/gin"

	path = path + "-" + time.Now().Format("2006-01-02_15-04-05") + ".log"

	f, err := os.Create(path)
	if err != nil {
		panic(err)
	}
	gin.DefaultWriter = io.MultiWriter(f)

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	r.POST("/user/login", controller.Login)

	r.Use(middleware.AuthMiddleware())

	rs := routes.RouteSeter{Router: r}

	rs.SetCRUD(&entity.User{})
	rs.SetCRUD(&entity.Item{})
	rs.SetCRUD(&entity.Location{})
	rs.SetCRUD(&entity.Allocation{})
	rs.SetCRUD(&entity.Role{})
	rs.SetCRUD(&entity.Category{})

	r.GET("/item/quantity/:id", controller.CountItensController)
	r.GET("/user/validate", controller.ValidateToken)

	r.GET("/rel/allocbyuser", controller.RelAllocByUser)
	r.GET("/rel/allocbyitem", controller.RelAllocByItem)
	r.GET("/rel/itembylocation", controller.RelItemByLocation)
	r.GET("/rel/itembycategory", controller.RelItemByCategory)
	r.GET("/rel/userbyrole", controller.RelUserByRole)

	r.GET("/role-permission/:id", controller.GetRolePermission)
	r.POST("/role-permission", controller.CreatePermission)
	r.PUT("/role-permission", controller.UpdatePermission)
	r.GET("/role-permission", controller.GetPermission)

	// https://github.com/gin-gonic/gin/blob/v1.10.0/docs/doc.md#custom-middleware

	r.Run() // listen and serve on
}
