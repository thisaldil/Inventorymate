import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/paginate.js';

export const createCrudController = (Model, options = {}) => {
  const {
    searchFields = [],
    filterFields = [],
    populate = [],
  } = options;

  const getAll = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);

    const query = {};

    filterFields.forEach((field) => {
      if (req.query[field]) {
        query[field] = req.query[field];
      }
    });

    if (
      typeof req.query.search === 'string' &&
      req.query.search.trim() &&
      searchFields.length
    ) {
      const search = req.query.search.trim();

      query.$or = searchFields.map((field) => ({
        [field]: {
          $regex: search,
          $options: 'i',
        },
      }));
    }

    let dbQuery = Model.find(query);

    populate.forEach((item) => {
      dbQuery = dbQuery.populate(item);
    });

    const [items, total] = await Promise.all([
      dbQuery
        .sort(req.query.sort || '-createdAt')
        .skip(skip)
        .limit(limit),
      Model.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  const getOne = asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    populate.forEach((item) => {
      query = query.populate(item);
    });

    const item = await query;

    if (!item) {
      return next(new AppError(`${Model.modelName} not found`, 404));
    }

    res.json({
      success: true,
      data: item,
    });
  });

  const createOne = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);

    res.status(201).json({
      success: true,
      data: item,
    });
  });

  const updateOne = asyncHandler(async (req, res, next) => {
    let query = Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    populate.forEach((item) => {
      query = query.populate(item);
    });

    const item = await query;

    if (!item) {
      return next(new AppError(`${Model.modelName} not found`, 404));
    }

    res.json({
      success: true,
      data: item,
    });
  });

  const deleteOne = asyncHandler(async (req, res, next) => {
    const item = await Model.findByIdAndDelete(req.params.id);

    if (!item) {
      return next(new AppError(`${Model.modelName} not found`, 404));
    }

    res.json({
      success: true,
      message: `${Model.modelName} deleted`,
    });
  });

  return {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
  };
};