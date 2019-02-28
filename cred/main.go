package main

import (
	"encoding/base64"
	"fmt"
	"github.com/go-redis/redis"
	"log"
)

func main() {
	var username, password string
	fmt.Println("Please input username")
	_, err := fmt.Scanf("%s", &username)
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println("Please input password")
	_, err = fmt.Scanf("%s", &password)
	if err != nil {
		log.Fatalln(err)
	}
	client := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf(
			"%s:%s",
			RetrieveEnv("USERS_DB_HOST", "ssdb-credentials"),
			RetrieveEnv("USERS_DB_PORT", "8888"),
		),
	})
	err = client.Set("username", base64.StdEncoding.EncodeToString([]byte(username)), 0).Err()
	if err != nil {
		log.Fatalln(err)
	}
	err = client.Set("password", base64.StdEncoding.EncodeToString([]byte(password)), 0).Err()
	if err != nil {
		log.Fatalln(err)
	}
}
