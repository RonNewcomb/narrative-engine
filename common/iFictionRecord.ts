export const AuthoringTool = "Tin Book";

export interface iFictionRecord {
  story: {
    identification: {
      ifid: string[];
      format: "html";
    };
    bibliographic: {
      title: string;
      author: string;
      language: string;
      headline: string;
      firstpublished: string | number;
      genre?: string;
      group?: typeof AuthoringTool;
      forgiveness?: string;
      description: string;
      series?: string;
      seriesnumber?: string | number;
      resources?: {
        auxiliary?: {
          leafname?: string;
          description?: string;
        }[];
      };
      contacts?: {
        url?: string;
        authoremail?: string;
      };
      cover?: {
        format?: string;
        height?: string | number;
        width?: string | number;
        description?: string;
      };
    };
    colophon?: {
      generator: typeof AuthoringTool;
      generatorversion: string;
      originated: string; // yyyy-mm-dd
    };
  };
}
