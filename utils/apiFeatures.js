class ApiFeatures {
    constructor (query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(element => delete queryObj[element]);
        let dataFilter = {};
        if (Object.keys(queryObj).length !== 0) {
            let index;
            dataFilter = JSON.stringify(queryObj)
            .split("")
            .map((el, i) => {
                if (el === '{' && i > 0) index = i + 2;
                if (i === index) el = `$${el}`;
                return el;
            })
            .join('');
            dataFilter = JSON.parse(dataFilter);
        }
        this.query = this.query.find(dataFilter)
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page*1 || 1;
        const limit =  this.queryString.limit*1 ||  30;
        const skip = (page -1) * limit;
        // if(this.queryString.page) {
        //     const numberOfDocuments = await this.query.countDocuments();
        //     if(skip >= numberOfDocuments) {
        //         throw 'page not found';
        //     } 
        // }
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    limitFields() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v"); //loại bỏ trường này vì mongo tự động tạo nó, và xử lí nội bộ
        }
        return this;
    }

}

module.exports = ApiFeatures;