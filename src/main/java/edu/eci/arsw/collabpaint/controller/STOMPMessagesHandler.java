package edu.eci.arsw.collabpaint.controller;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class STOMPMessagesHandler {
	
	
	ConcurrentHashMap<String, LinkedList<Point>> points = new ConcurrentHashMap<>(); 

	@Autowired
	SimpMessagingTemplate msgt;
    
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
		System.out.println("Nuevo punto recibido en el servidor!:"+pt);

		points.putIfAbsent(numdibujo, new LinkedList<>());
		points.get(numdibujo).add(pt);
		msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);

		if(points.get(numdibujo).size() > 3){
			msgt.convertAndSend("/topic/newpolygon."+numdibujo, points.get(numdibujo));
			points.get(numdibujo).clear();
		}
	}
}

