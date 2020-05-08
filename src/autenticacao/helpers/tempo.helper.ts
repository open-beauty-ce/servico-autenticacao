export class TempoHelper {
  static segundos(n: number): number {
    return n * 1000;
  }

  static minutos(n: number): number {
    return n * this.segundos(60);
  }

  static horas(n: number): number {
    return n * this.minutos(60);
  }

  static dias(n: number): number {
    return n * this.horas(24);
  }

  static anos(n: number): number {
    return n * this.dias(365);
  }
}
