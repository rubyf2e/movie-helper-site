import { AIMovieService } from "./aiMovieService";
import { DEFAULT_STORAGE_KEY } from "../utils/constants";
import { LineAuthService } from "./lineAuthService";

export const lineAuthService = new LineAuthService();
export const aiMovieService = new AIMovieService(DEFAULT_STORAGE_KEY);
export const LOCAL_STORAGE_KEY = aiMovieService.getStoredKey();

const globalServices = {
  aiMovieService,
  lineAuthService,
  LOCAL_STORAGE_KEY,
};

export default globalServices;
