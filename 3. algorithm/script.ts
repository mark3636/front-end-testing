class Vertex {
  private value: any;
  private edges: Edge[];

  constructor(value: any) {
    this.value = value;
    this.edges = [];
  }

  public getKey(): any {
    return this.value;
  }

  public getEdges(): Edge[] {
    return this.edges;
  }

  public addEdge(edge: Edge): void {
    this.edges.push(edge);
  }

  public deleteEdge(edge: Edge): void {
    const ind = this.edges.map((elem) => elem.getKey()).indexOf(edge.getKey());
    if (ind > -1) {
      this.edges.splice(ind, 1);
    }
  }

  public findEdge(vertex: Vertex): Edge {
    const indS = this.edges.map((elem) => elem.getStartVertex().getKey()).indexOf(vertex.getKey());
    if (indS > -1) {
      return this.edges[indS];
    }
    const indE = this.edges.map((elem) => elem.getEndVertex().getKey()).indexOf(vertex.getKey());
    if (indE > -1) {
      return this.edges[indE];
    }

    return null;
  }

  public getNeighbors(): Vertex[] {
    return this.edges.map((elem) => {
      return elem.getStartVertex().getKey() === this.value ? elem.getEndVertex() : elem.getStartVertex();
    });
  }

  public toString(): string {
    return this.value;
  }
}

class Edge {
  private startVertex: Vertex;
  private endVertex: Vertex;
  private weight: number = 0;

  constructor(startVertex: Vertex, endVertex: Vertex, weight = 0) {
    this.startVertex = startVertex;
    this.endVertex = endVertex;
    this.weight = weight;
  }

  public getStartVertex(): Vertex {
    return this.startVertex;
  }

  public getEndVertex(): Vertex {
    return this.endVertex;
  }

  public getWeight(): number {
    return this.weight;
  }

  public reverse(): Edge {
    const tmp = this.startVertex;
    this.startVertex = this.endVertex;
    this.endVertex = tmp;
    return this;
  }

  public getKey(): string {
    const startVertexKey = this.startVertex.getKey();
    const endVertexKey = this.endVertex.getKey();

    return `${startVertexKey}_${endVertexKey}`;
  }

  public toString(): string {
    return this.getKey();
  }
}

class Graph {
  private vertices: { [key: string]: Vertex; } = {};
  private edges: { [key: string]: Edge; } = {};
  private isDirected: boolean;

  constructor(isDirected = false) {
    this.vertices = {};
    this.edges = {};
    this.isDirected = isDirected;
  }

  public getAllVertices(): Vertex[] {
    return Object.keys(this.vertices).map(key => this.vertices[key]);
  }

  public getAllEdges(): Edge[] {
    return Object.keys(this.edges).map(key => this.edges[key]);
  }

  public addVertex(newVertex: Vertex): void {
    this.vertices[newVertex.getKey()] = newVertex;
  }

  public deleteVertex(vertex: Vertex): boolean {
    if (this.vertices[vertex.getKey()]) {
      delete this.vertices[vertex.getKey()];
    } else {
      return false;
    }

    vertex.getNeighbors().forEach((neighbor) => {
      const edge = neighbor.findEdge(vertex);
      neighbor.deleteEdge(edge);
      delete this.edges[edge.getKey()];
      neighbor.deleteEdge(edge.reverse());
      delete this.edges[edge.getKey()];
    })
    return true;
  }

  public getVertexByKey(vertexKey: any): Vertex {
    return this.vertices[vertexKey];
  }

  public getNeighbors(vertex: Vertex): Vertex[] {
    return vertex.getNeighbors();
  }

  public addEdge(edge: Edge): boolean {
    let startVertex = this.getVertexByKey(edge.getStartVertex().getKey());
    let endVertex = this.getVertexByKey(edge.getEndVertex().getKey());

    if (!startVertex) {
      this.addVertex(edge.getStartVertex());
      startVertex = this.getVertexByKey(edge.getStartVertex().getKey());
    }

    if (!endVertex) {
      this.addVertex(edge.getEndVertex());
      endVertex = this.getVertexByKey(edge.getEndVertex().getKey());
    }

    if (this.edges[edge.getKey()]) {
      return false;
    } else {
      this.edges[edge.getKey()] = edge;
    }

    if (this.isDirected) {
      startVertex.addEdge(edge);
    } else {
      startVertex.addEdge(edge);
      endVertex.addEdge(edge);
    }
    return true;
  }

  public deleteEdge(edge: Edge): boolean {
    if (this.edges[edge.getKey()]) {
      delete this.edges[edge.getKey()];
    } else {
      return false;
    }

    const startVertex = this.getVertexByKey(edge.getStartVertex().getKey());
    const endVertex = this.getVertexByKey(edge.getEndVertex().getKey());

    startVertex.deleteEdge(edge);
    endVertex.deleteEdge(edge);
    return true;
  }

  public findEdge(startVertex: Vertex, endVertex: Vertex): Edge {
    const vertex = this.getVertexByKey(startVertex.getKey());

    if (!vertex) {
      return null;
    }

    return vertex.findEdge(endVertex);
  }

  public getWeight(edge: Edge): number {
    return this.edges[edge.getKey()].getWeight();
  }

  public reverse(): void {
    this.getAllEdges().forEach((edge: Edge) => {
      this.deleteEdge(edge);
      edge.reverse();
      this.addEdge(edge);
    });
  }

  private getVerticesIndices() {
    const verticesIndices = {};
    this.getAllVertices().forEach((vertex, index) => {
      verticesIndices[vertex.getKey()] = index;
    });

    return verticesIndices;
  }

  public getAdjacencyMatrix() {
    const vertices = this.getAllVertices();
    const verticesIndices = this.getVerticesIndices();

    const adjacencyMatrix = Array<Number>(vertices.length).fill(null).map(() => {
      return Array<Number>(vertices.length).fill(Infinity);
    });

    vertices.forEach((vertex, vertexIndex) => {
      vertex.getNeighbors().forEach((neighbor) => {
        const neighborIndex = verticesIndices[neighbor.getKey()];
        adjacencyMatrix[vertexIndex][neighborIndex] = this.findEdge(vertex, neighbor).getWeight();
      });
    });

    return adjacencyMatrix;
  }

  public toString(): string {
    return Object.keys(this.vertices).toString();
  }
}
