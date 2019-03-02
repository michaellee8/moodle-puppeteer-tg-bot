package main

import (
	"log"
)

func main() {
	log.Println("Server main")
	s := Server{}
	err := s.Init()
	log.Println("Server init")
	if err != nil {
		log.Fatalln(err)
	}
	s.RegisterCommands()
	//log.Println("Server started")
}
