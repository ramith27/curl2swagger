import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-project')
  handleJoinProject(@MessageBody() projectId: string, @ConnectedSocket() client: Socket) {
    client.join(`project:${projectId}`);
    this.logger.log(`Client ${client.id} joined project ${projectId}`);
  }

  @SubscribeMessage('leave-project')
  handleLeaveProject(@MessageBody() projectId: string, @ConnectedSocket() client: Socket) {
    client.leave(`project:${projectId}`);
    this.logger.log(`Client ${client.id} left project ${projectId}`);
  }

  // Emit events to all clients in a project room
  emitToProject(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data);
  }

  // Emit capture events
  emitCaptureCreated(projectId: string, capture: any) {
    this.emitToProject(projectId, 'capture:created', capture);
  }

  emitCaptureDeleted(projectId: string, captureId: string) {
    this.emitToProject(projectId, 'capture:deleted', { captureId });
  }

  // Emit spec events
  emitSpecGenerated(projectId: string, spec: any) {
    this.emitToProject(projectId, 'spec:generated', spec);
  }

  emitQualityReport(projectId: string, report: any) {
    this.emitToProject(projectId, 'quality:report', report);
  }
}
